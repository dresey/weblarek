import type { ICustomerDetails, TCustomerValidationErrors } from '../../types';

const EMPTY_CUSTOMER_DETAILS: ICustomerDetails = {
    payment: '',
    email: '',
    phone: '',
    address: '',
};

export class CustomerData {
    private details: ICustomerDetails = { ...EMPTY_CUSTOMER_DETAILS };

    updateDetails(changes: Partial<ICustomerDetails>): void {
        this.details = { ...this.details, ...changes };
    }

    getDetails(): ICustomerDetails {
        return { ...this.details };
    }

    clearDetails(): void {
        this.details = { ...EMPTY_CUSTOMER_DETAILS };
    }

    getValidationErrors(): TCustomerValidationErrors {
        const errors: TCustomerValidationErrors = {};

        if (!this.details.payment) {
            errors.payment = 'Выберите способ оплаты';
        }
        if (!this.details.address.trim()) {
            errors.address = 'Укажите адрес доставки';
        }
        if (!this.details.email.trim()) {
            errors.email = 'Укажите email';
        }
        if (!this.details.phone.trim()) {
            errors.phone = 'Укажите номер телефона';
        }

        return errors;
    }
}
