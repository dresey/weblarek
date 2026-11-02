import type { IStoreProduct } from '../../types';
import type { IEvents } from '../base/Events';

export class ShoppingCart {
    private products: IStoreProduct[] = [];

    constructor(protected events: IEvents) {}

    getProducts(): IStoreProduct[] {
        return [...this.products];
    }

    addProduct(product: IStoreProduct): void {
        if (!this.containsProduct(product.id)) {
            this.products.push(product);
            this.events.emit('cart:changed');
        }
    }

    removeProduct(productId: string): void {
        this.products = this.products.filter((product) => product.id !== productId);
        this.events.emit('cart:changed');
    }

    clearProducts(): void {
        this.products = [];
        this.events.emit('cart:changed');
    }

    getTotalPrice(): number {
        return this.products.reduce((totalPrice, product) => totalPrice + (product.price ?? 0), 0);
    }

    getProductCount(): number {
        return this.products.length;
    }

    containsProduct(productId: string): boolean {
        return this.products.some((product) => product.id === productId);
    }
}
