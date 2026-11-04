import { Component } from '../base/Component';
import type { IEvents } from '../base/Events';
import { ensureElement } from '../../utils/utils';

interface IBasket {
    items: HTMLElement[];
    total: number;
}

export class Basket extends Component<IBasket> {
    protected listElement: HTMLElement;
    protected totalElement: HTMLElement;
    protected buttonElement: HTMLButtonElement;

    constructor(container: HTMLElement, protected events: IEvents) {
        super(container);

        this.listElement = ensureElement<HTMLElement>('.basket__list', container);
        this.totalElement = ensureElement<HTMLElement>('.basket__price', container);
        this.buttonElement = ensureElement<HTMLButtonElement>('.basket__button', container);
        this.buttonElement.addEventListener('click', () => {
            this.events.emit('order:start');
        });
    }

    set items(items: HTMLElement[]) {
        this.listElement.replaceChildren(...items);
    }

    set total(value: number) {
        this.totalElement.textContent = `${value} синапсов`;
    }

    disableButton(): void {
        this.buttonElement.disabled = true;
    }

    enableButton(): void {
        this.buttonElement.disabled = false;
    }

    getContainer(): HTMLElement {
        return super.render();
    }
}
