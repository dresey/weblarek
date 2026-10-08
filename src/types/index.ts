export type ApiPostMethod = 'POST' | 'PUT' | 'DELETE';

export interface IApi {
    get<T extends object>(endpoint: string): Promise<T>;
    post<T extends object>(endpoint: string, payload: object, method?: ApiPostMethod): Promise<T>;
}

export type TPaymentOption = 'card' | 'cash';

export interface IStoreProduct {
    id: string;
    description: string;
    image: string;
    title: string;
    category: string;
    price: number | null;
}

export interface ICustomerDetails {
    payment: TPaymentOption | '';
    email: string;
    phone: string;
    address: string;
}

export type TCustomerValidationErrors = Partial<Record<keyof ICustomerDetails, string>>;

export interface IProductListResponse {
    total: number;
    items: IStoreProduct[];
}

export interface IOrderPayload extends ICustomerDetails {
    total: number;
    items: string[];
}

export interface IOrderConfirmation {
    id: string;
    total: number;
}
