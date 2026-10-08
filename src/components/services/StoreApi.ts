import type { IApi, IOrderConfirmation, IOrderPayload, IProductListResponse } from '../../types';

export class StoreApi {
    constructor(private readonly client: IApi) {}

    requestProducts(): Promise<IProductListResponse> {
        return this.client.get<IProductListResponse>('/product/');
    }

    submitOrder(order: IOrderPayload): Promise<IOrderConfirmation> {
        return this.client.post<IOrderConfirmation>('/order/', order);
    }
}
