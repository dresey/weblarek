import { Component } from '../base/Component';
import type { IEvents } from '../base/Events';
import { ensureElement } from '../../utils/utils';

interface IForm {
    valid: boolean;
    errors: string[];
}

export abstract class Form<T> extends Component<T & IForm> {
    protected submitButton: HTMLButtonElement;
    protected errorsElement: HTMLElement;

    constructor(protected container: HTMLFormElement, protected events: IEvents) {
        super(container);

        this.submitButton = ensureElement<HTMLButtonElement>('button[type=submit]', container);
        this.errorsElement = ensureElement<HTMLElement>('.form__errors', container);

        this.container.addEventListener('input', (event: Event) => {
            if (!(event.target instanceof HTMLInputElement)) return;
            const field = event.target.name as keyof T;
            const value = event.target.value;
            this.onInputChange(field, value);
        });

        this.container.addEventListener('submit', (event: Event) => {
            event.preventDefault();
            this.events.emit(`${this.container.name}:submit`);
        });
    }

    protected onInputChange(field: keyof T, value: string): void {
        this.events.emit(`${this.container.name}:change`, {
            field,
            value
        });
    }

    set valid(value: boolean) {
        this.submitButton.disabled = !value;
    }

    set errors(value: string[]) {
        this.errorsElement.textContent = value.join(', ');
    }

    getContainer(): HTMLElement {
        return this.container;
    }
}
