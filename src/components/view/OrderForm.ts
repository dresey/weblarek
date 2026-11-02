import { Form } from './Form';
import type { IEvents } from '../base/Events';
import type { TPaymentOption } from '../../types';
import { ensureElement } from '../../utils/utils';

interface IOrderForm {
    payment: TPaymentOption | '';
    address: string;
}

export class OrderForm extends Form<IOrderForm> {
    protected paymentButtons: HTMLButtonElement[];
    protected addressElement: HTMLInputElement;

    constructor(container: HTMLFormElement, events: IEvents) {
        super(container, events);

        this.paymentButtons = Array.from(container.querySelectorAll('.order__buttons .button')) as HTMLButtonElement[];
        this.addressElement = ensureElement<HTMLInputElement>('[name="address"]', container);

        this.paymentButtons.forEach(button => {
            button.addEventListener('click', () => {
                const name = button.name;
                if (name === 'card' || name === 'cash') {
                    this.events.emit('order:change', { field: 'payment', value: name });
                }
            });
        });
    }

    set payment(value: TPaymentOption | '') {
        this.paymentButtons.forEach(button => {
            button.classList.toggle('button_alt-active', button.name === value);
        });
    }

    set address(value: string) {
        this.addressElement.value = value;
    }
}
