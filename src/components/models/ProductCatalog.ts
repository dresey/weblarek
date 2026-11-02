import type { IStoreProduct } from '../../types';
import type { IEvents } from '../base/Events';

export class ProductCatalog {
    private products: IStoreProduct[] = [];
    private activeProduct: IStoreProduct | null = null;

    constructor(protected events: IEvents) {}

    replaceProducts(products: IStoreProduct[]): void {
        this.products = [...products];
        this.events.emit('catalog:changed');
    }

    getProducts(): IStoreProduct[] {
        return [...this.products];
    }

    findProduct(productId: string): IStoreProduct | undefined {
        return this.products.find((product) => product.id === productId);
    }

    setActiveProduct(product: IStoreProduct): void {
        this.activeProduct = product;
        this.events.emit('product:selected');
    }

    getActiveProduct(): IStoreProduct | null {
        return this.activeProduct;
    }
}
