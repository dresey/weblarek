import { Form } from './Form';
import type { IEvents } from '../base/Events';
import type { TPaymentOption } from '../../types';

interface IOrderForm {
    payment: TPaymentOption | '';
    address: string;
}

export class OrderForm extends Form<IOrderForm> {
    protected paymentButtons: HTMLButtonElement[];

    constructor(container: HTMLElement, events: IEvents) {
        super(container, events);

        this.paymentButtons = Array.from(container.querySelectorAll('.order__buttons .button')) as HTMLButtonElement[];

        this.paymentButtons.forEach(button => {
            button.addEventListener('click', () => {
                const name = button.getAttribute('name') as TPaymentOption;
                this.setPayment(name);
                this.onInputChange('payment', name);
            });
        });
    }

    setPayment(name: TPaymentOption): void {
        this.paymentButtons.forEach(button => {
            button.classList.toggle('button_alt-active', button.getAttribute('name') === name);
        });
    }

    set address(value: string) {
        const input = this.formElement.elements.namedItem('address') as HTMLInputElement;
        if (input) {
            input.value = value;
        }
    }

    clear(): void {
        super.clear();
        this.paymentButtons.forEach(button => {
            button.classList.remove('button_alt-active');
        });
    }
}
