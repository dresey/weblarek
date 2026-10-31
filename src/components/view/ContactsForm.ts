import { Form } from './Form';
import type { IEvents } from '../base/Events';

interface IContactsForm {
    email: string;
    phone: string;
}

export class ContactsForm extends Form<IContactsForm> {
    constructor(container: HTMLElement, events: IEvents) {
        super(container, events);
    }

    set email(value: string) {
        const input = this.formElement.elements.namedItem('email') as HTMLInputElement;
        if (input) {
            input.value = value;
        }
    }

    set phone(value: string) {
        const input = this.formElement.elements.namedItem('phone') as HTMLInputElement;
        if (input) {
            input.value = value;
        }
    }
}
