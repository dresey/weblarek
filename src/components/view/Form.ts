import { Component } from '../base/Component';
import type { IEvents } from '../base/Events';

interface IForm {
    valid: boolean;
    errors: string[];
}

export abstract class Form<T> extends Component<IForm> {
    protected submitButton: HTMLButtonElement;
    protected errorsElement: HTMLElement;
    protected formElement: HTMLFormElement;

    constructor(container: HTMLElement, protected events: IEvents) {
        super(container);

        this.formElement = container as HTMLFormElement;
        this.submitButton = container.querySelector('button[type=submit]') as HTMLButtonElement;
        this.errorsElement = container.querySelector('.form__errors') as HTMLElement;

        this.formElement.addEventListener('input', (event: Event) => {
            const target = event.target as HTMLInputElement;
            const field = target.name as keyof T;
            const value = target.value;
            this.onInputChange(field, value);
        });

        this.formElement.addEventListener('submit', (event: Event) => {
            event.preventDefault();
            this.events.emit(`${this.formElement.name}:submit`);
        });
    }

    protected onInputChange(field: keyof T, value: string): void {
        this.events.emit(`${this.formElement.name}:change`, {
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

    clear(): void {
        this.formElement.reset();
    }

    render(state: Partial<T> & IForm): HTMLElement {
        const { valid, errors, ...inputs } = state;
        super.render({ valid, errors });
        Object.assign(this, inputs);
        return this.container;
    }
}
