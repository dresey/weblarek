import './scss/styles.scss';

import { Api } from './components/base/Api';
import { CustomerData } from './components/models/CustomerData';
import { ProductCatalog } from './components/models/ProductCatalog';
import { ShoppingCart } from './components/models/ShoppingCart';
import { StoreApi } from './components/services/StoreApi';
import { API_BASE_URL } from './utils/constants';
import { sampleCatalogResponse } from './utils/data';

const catalog = new ProductCatalog();
catalog.replaceProducts(sampleCatalogResponse.items);
console.info('Catalog products:', catalog.getProducts());

const products = catalog.getProducts();
const firstProduct = products[0];
const secondProduct = products[1];
const unavailableProduct = products[2];

if (firstProduct && secondProduct && unavailableProduct) {
    console.info('Catalog product by identifier:', catalog.findProduct(firstProduct.id));
    console.info('Missing catalog product:', catalog.findProduct('missing-product'));
    console.info('Active product before selection:', catalog.getActiveProduct());
    catalog.setActiveProduct(firstProduct);
    console.info('Active product after selection:', catalog.getActiveProduct());

    const cart = new ShoppingCart();
    cart.addProduct(firstProduct);
    cart.addProduct(secondProduct);
    cart.addProduct(unavailableProduct);
    cart.addProduct(firstProduct);
    console.info('Cart products after adding:', cart.getProducts());
    console.info('Cart product count:', cart.getProductCount());
    console.info('Cart total price:', cart.getTotalPrice());
    console.info('Cart contains first product:', cart.containsProduct(firstProduct.id));

    cart.removeProduct(firstProduct.id);
    console.info('Cart products after deletion:', cart.getProducts());
    console.info('Cart contains deleted product:', cart.containsProduct(firstProduct.id));
    console.info('Cart total after deletion:', cart.getTotalPrice());

    cart.clearProducts();
    console.info('Cart products after clearing:', cart.getProducts());
    console.info('Cart product count after clearing:', cart.getProductCount());
}

const customer = new CustomerData();
console.info('Empty customer validation errors:', customer.getValidationErrors());

customer.updateDetails({ payment: 'card' });
customer.updateDetails({ address: 'Moscow, Pushkina street, 1' });
console.info('Customer details after first step:', customer.getDetails());
console.info('Customer validation errors after first step:', customer.getValidationErrors());

customer.updateDetails({ email: 'customer@example.com', phone: '+7 999 123-45-67' });
console.info('Completed customer details:', customer.getDetails());
console.info('Completed customer validation errors:', customer.getValidationErrors());

customer.clearDetails();
console.info('Customer details after clearing:', customer.getDetails());

const storeApi = new StoreApi(new Api(API_BASE_URL));

storeApi
    .requestProducts()
    .then((response) => {
        catalog.replaceProducts(response.items);
        console.info('Catalog products loaded from the server:', catalog.getProducts());
    })
    .catch((error: unknown) => {
        console.error('Could not load catalog products:', error);
    });
