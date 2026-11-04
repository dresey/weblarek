import './scss/styles.scss';

import { Api } from './components/base/Api';
import { EventEmitter } from './components/base/Events';
import { CustomerData } from './components/models/CustomerData';
import { ProductCatalog } from './components/models/ProductCatalog';
import { ShoppingCart } from './components/models/ShoppingCart';
import { StoreApi } from './components/services/StoreApi';
import { Modal } from './components/view/Modal';
import { Gallery } from './components/view/Gallery';
import { Header } from './components/view/Header';
import { CardCatalog } from './components/view/CardCatalog';
import { CardPreview } from './components/view/CardPreview';
import { CardBasket } from './components/view/CardBasket';
import { Basket } from './components/view/Basket';
import { OrderForm } from './components/view/OrderForm';
import { ContactsForm } from './components/view/ContactsForm';
import { Success } from './components/view/Success';
import { API_URL } from './utils/constants';
import type { ICustomerDetails, IOrderPayload } from './types';
import { cloneTemplate, ensureElement } from './utils/utils';

// Инициализация событий и моделей данных
const events = new EventEmitter();
const catalog = new ProductCatalog(events);
const cart = new ShoppingCart(events);
const customer = new CustomerData(events);

// Инициализация API
const apiClient = new Api(API_URL);
const api = new StoreApi(apiClient);

// Инициализация представлений
const gallery = new Gallery(ensureElement<HTMLElement>('.gallery'));
const header = new Header(ensureElement<HTMLElement>('.header'), events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);

// Темплейты
const catalogCardTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const previewCardTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const basketCardTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');
const successTemplate = ensureElement<HTMLTemplateElement>('#success');

// Создание переиспользуемых компонентов
const preview = new CardPreview(cloneTemplate(previewCardTemplate), events);
const basket = new Basket(cloneTemplate(basketTemplate), events);
const orderForm = new OrderForm(cloneTemplate<HTMLFormElement>(orderTemplate), events);
const contactsForm = new ContactsForm(cloneTemplate<HTMLFormElement>(contactsTemplate), events);
const success = new Success(cloneTemplate(successTemplate), events);

// Обработчики событий моделей данных

// Изменение каталога товаров
events.on('catalog:changed', () => {
    const products = catalog.getProducts();
    const cards = products.map(product => {
        const card = new CardCatalog(
            cloneTemplate(catalogCardTemplate),
            () => events.emit('card:select', { id: product.id })
        );
        return card.render({
            title: product.title,
            price: product.price,
            image: product.image,
            category: product.category
        });
    });
    gallery.render({ items: cards });
});

// Выбор товара для просмотра
events.on('product:selected', () => {
    const product = catalog.getActiveProduct();
    if (product) {
        const isInCart = cart.containsProduct(product.id);
        const isPriceless = product.price === null;
        
        modal.render({
            content: preview.render({
                title: product.title,
                image: product.image,
                category: product.category,
                description: product.description,
                price: product.price,
                button: isPriceless ? 'Недоступно' : (isInCart ? 'Удалить из корзины' : 'В корзину'),
                buttonDisabled: isPriceless
            })
        });
    }
});

// Изменение корзины
events.on('cart:changed', () => {
    const products = cart.getProducts();
    header.render({ counter: cart.getProductCount() });
    
    const cards = products.map((product, index) => {
        const card = new CardBasket(
            cloneTemplate(basketCardTemplate),
            () => events.emit('card:remove', { id: product.id })
        );
        return card.render({
            title: product.title,
            price: product.price,
            index: index + 1
        });
    });
    
    basket.items = cards;
    basket.total = cart.getTotalPrice();
    
    if (products.length === 0) {
        basket.disableButton();
    } else {
        basket.enableButton();
    }
});

// Изменение данных покупателя
events.on('customer:changed', () => {
    const data = customer.getDetails();
    const errors = customer.getValidationErrors();
    
    orderForm.render({
        payment: data.payment,
        address: data.address,
        valid: !errors.payment && !errors.address,
        errors: [errors.payment, errors.address]
            .filter((error): error is string => error !== undefined)
    });
    
    contactsForm.render({
        email: data.email,
        phone: data.phone,
        valid: !errors.email && !errors.phone,
        errors: [errors.email, errors.phone]
            .filter((error): error is string => error !== undefined)
    });
});

// Обработчики событий представлений

// Выбор карточки в каталоге
events.on('card:select', ({ id }: { id: string }) => {
    const product = catalog.findProduct(id);
    if (product) {
        catalog.setActiveProduct(product);
    }
});

// Действие с карточкой (добавить/удалить)
events.on('card:action', () => {
    const product = catalog.getActiveProduct();
    if (!product) return;
    
    if (cart.containsProduct(product.id)) {
        cart.removeProduct(product.id);
    } else {
        cart.addProduct(product);
    }
    modal.close();
});

// Удаление товара из корзины
events.on('card:remove', ({ id }: { id: string }) => {
    cart.removeProduct(id);
});

// Открытие корзины
events.on('basket:open', () => {
    modal.render({ content: basket.render() });
});

// Начало оформления заказа
events.on('order:start', () => {
    const details = customer.getDetails();
    const errors = customer.getValidationErrors();
    const { payment, address } = errors;
    
    const orderErrors = [];
    if (payment) orderErrors.push(payment);
    if (address) orderErrors.push(address);
    
    modal.render({
        content: orderForm.render({
            payment: details.payment,
            address: details.address,
            valid: orderErrors.length === 0,
            errors: orderErrors
        })
    });
});

// Изменение данных в форме заказа
events.on('order:change', (change: { field: keyof ICustomerDetails; value: string }) => {
    customer.updateDetails({ [change.field]: change.value });
});

// Отправка формы заказа (переход к контактам)
events.on('order:submit', () => {
    const details = customer.getDetails();
    const errors = customer.getValidationErrors();
    const { email, phone } = errors;
    
    const contactErrors = [];
    if (email) contactErrors.push(email);
    if (phone) contactErrors.push(phone);
    
    modal.render({
        content: contactsForm.render({
            email: details.email,
            phone: details.phone,
            valid: contactErrors.length === 0,
            errors: contactErrors
        })
    });
});

// Изменение данных в форме контактов
events.on('contacts:change', (change: { field: keyof ICustomerDetails; value: string }) => {
    customer.updateDetails({ [change.field]: change.value });
});

// Отправка формы контактов (оплата)
events.on('contacts:submit', () => {
    const orderData: IOrderPayload = {
        ...customer.getDetails(),
        total: cart.getTotalPrice(),
        items: cart.getProducts().map(product => product.id)
    };
    
    api.submitOrder(orderData)
        .then((result) => {
            modal.render({ content: success.render({ total: result.total }) });
            
            cart.clearProducts();
            customer.clearDetails();
        })
        .catch((error: unknown) => {
            console.error('Ошибка оформления заказа:', error);
        });
});

// Закрытие экрана успеха
events.on('success:close', () => {
    modal.close();
});

// Инициализация моделей в исходное состояние
cart.clearProducts();
customer.clearDetails();

// Загрузка каталога товаров с сервера
api.requestProducts()
    .then((response) => {
        catalog.replaceProducts(response.items);
    })
    .catch((error: unknown) => {
        console.error('Не удалось загрузить каталог товаров:', error);
    });
