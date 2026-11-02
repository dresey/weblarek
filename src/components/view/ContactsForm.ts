import { Form } from './Form';
import type { IEvents } from '../base/Events';
import { ensureElement } from '../../utils/utils';

interface IContactsForm {
    email: string;
    phone: string;
}

export class ContactsForm extends Form<IContactsForm> {
    protected emailElement: HTMLInputElement;
    protected phoneElement: HTMLInputElement;

    constructor(container: HTMLFormElement, events: IEvents) {
        super(container, events);

        this.emailElement = ensureElement<HTMLInputElement>('[name="email"]', container);
        this.phoneElement = ensureElement<HTMLInputElement>('[name="phone"]', container);
    }

    set email(value: string) {
        this.emailElement.value = value;
    }

    set phone(value: string) {
        this.phoneElement.value = value;
    }
}
