import './scss/styles.scss';

import { Api } from './components/base/Api';
import { EventEmitter } from './components/base/Events';
import { CustomerData } from './components/models/CustomerData';
import { ProductCatalog } from './components/models/ProductCatalog';
import { ShoppingCart } from './components/models/ShoppingCart';
import { StoreApi } from './components/services/StoreApi';
import { Modal } from './components/view/Modal';
import { Page } from './components/view/Page';
import { CardCatalog } from './components/view/CardCatalog';
import { CardPreview } from './components/view/CardPreview';
import { CardBasket } from './components/view/CardBasket';
import { Basket } from './components/view/Basket';
import { OrderForm } from './components/view/OrderForm';
import { ContactsForm } from './components/view/ContactsForm';
import { Success } from './components/view/Success';
import { API_BASE_URL } from './utils/constants';
import type { ICustomerDetails, IOrderPayload } from './types';
import { cloneTemplate, ensureElement } from './utils/utils';

// Инициализация событий и моделей данных
const events = new EventEmitter();
const catalog = new ProductCatalog(events);
const cart = new ShoppingCart(events);
const customer = new CustomerData(events);

// Инициализация API
const api = new StoreApi(new Api(API_BASE_URL));

// Инициализация представлений
const page = new Page(document.body, events);
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
const basket = new Basket(cloneTemplate(basketTemplate), events);
const orderForm = new OrderForm(cloneTemplate(orderTemplate), events);
const contactsForm = new ContactsForm(cloneTemplate(contactsTemplate), events);

// Обработчики событий моделей данных

// Изменение каталога товаров
events.on('catalog:changed', () => {
    const products = catalog.getProducts();
    const cards = products.map(product => {
        const card = new CardCatalog(cloneTemplate(catalogCardTemplate), events);
        return card.render(product);
    });
    page.catalog = cards;
});

// Выбор товара для просмотра
events.on('product:selected', () => {
    const product = catalog.getActiveProduct();
    if (product) {
        const card = new CardPreview(cloneTemplate(previewCardTemplate), events);
        const isInCart = cart.containsProduct(product.id);
        
        card.render({
            ...product,
            button: product.price === null ? 'Недоступно' : (isInCart ? 'Удалить из корзины' : 'В корзину')
        });
        
        if (product.price === null && card.buttonElement) {
            card.buttonElement.disabled = true;
        }
        
        modal.render({ content: card.container });
    }
});

// Изменение корзины
events.on('cart:changed', () => {
    const products = cart.getProducts();
    page.counter = cart.getProductCount();
    
    const cards = products.map((product, index) => {
        const card = new CardBasket(cloneTemplate(basketCardTemplate), events);
        return card.render({
            ...product,
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
events.on('customer:changed', ({ errors }: { errors: Record<string, string> }) => {
    const { payment, address, email, phone } = errors;
    
    // Валидация для формы заказа
    const orderErrors = [];
    if (payment) orderErrors.push(payment);
    if (address) orderErrors.push(address);
    orderForm.valid = orderErrors.length === 0;
    orderForm.errors = orderErrors;
    
    // Валидация для формы контактов
    const contactErrors = [];
    if (email) contactErrors.push(email);
    if (phone) contactErrors.push(phone);
    contactsForm.valid = contactErrors.length === 0;
    contactsForm.errors = contactErrors;
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
events.on('card:action', ({ id }: { id: string }) => {
    const product = catalog.findProduct(id);
    if (product) {
        if (cart.containsProduct(id)) {
            cart.removeProduct(id);
        } else {
            cart.addProduct(product);
        }
        modal.close();
    }
});

// Удаление товара из корзины
events.on('card:remove', ({ id }: { id: string }) => {
    cart.removeProduct(id);
});

// Открытие корзины
events.on('basket:open', () => {
    modal.render({ content: basket.container });
});

// Начало оформления заказа
events.on('order:start', () => {
    modal.render({ content: orderForm.container });
});

// Изменение данных в форме заказа
events.on('order:change', ({ field, value }: { field: keyof ICustomerDetails; value: string }) => {
    customer.updateDetails({ [field]: value });
});

// Отправка формы заказа (переход к контактам)
events.on('order:submit', () => {
    modal.render({ content: contactsForm.container });
});

// Изменение данных в форме контактов
events.on('contacts:change', ({ field, value }: { field: keyof ICustomerDetails; value: string }) => {
    customer.updateDetails({ [field]: value });
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
            const success = new Success(cloneTemplate(successTemplate), events);
            success.total = result.total;
            modal.render({ content: success.container });
            
            cart.clearProducts();
            customer.clearDetails();
            orderForm.clear();
            contactsForm.clear();
        })
        .catch((error: unknown) => {
            console.error('Ошибка оформления заказа:', error);
        });
});

// Закрытие экрана успеха
events.on('success:close', () => {
    modal.close();
});

// Блокировка прокрутки страницы при открытии модального окна
events.on('modal:opened', () => {
    page.locked = true;
});

// Разблокировка прокрутки страницы при закрытии модального окна
events.on('modal:closed', () => {
    page.locked = false;
});

// Загрузка каталога товаров с сервера
api.requestProducts()
    .then((response) => {
        catalog.replaceProducts(response.items);
    })
    .catch((error: unknown) => {
        console.error('Не удалось загрузить каталог товаров:', error);
    });
