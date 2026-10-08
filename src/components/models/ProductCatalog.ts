import type { IStoreProduct } from '../../types';

export class ProductCatalog {
    private products: IStoreProduct[] = [];
    private activeProduct: IStoreProduct | null = null;

    replaceProducts(products: IStoreProduct[]): void {
        this.products = [...products];
    }

    getProducts(): IStoreProduct[] {
        return [...this.products];
    }

    findProduct(productId: string): IStoreProduct | undefined {
        return this.products.find((product) => product.id === productId);
    }

    setActiveProduct(product: IStoreProduct): void {
        this.activeProduct = product;
    }

    getActiveProduct(): IStoreProduct | null {
        return this.activeProduct;
    }
}
