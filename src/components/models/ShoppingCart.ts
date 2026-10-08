import type { IStoreProduct } from '../../types';

export class ShoppingCart {
    private products: IStoreProduct[] = [];

    getProducts(): IStoreProduct[] {
        return [...this.products];
    }

    addProduct(product: IStoreProduct): void {
        if (!this.containsProduct(product.id)) {
            this.products.push(product);
        }
    }

    removeProduct(productId: string): void {
        this.products = this.products.filter((product) => product.id !== productId);
    }

    clearProducts(): void {
        this.products = [];
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
