import { Component } from '../base/Component';
import type { IEvents } from '../base/Events';

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

        this.listElement = container.querySelector('.basket__list') as HTMLElement;
        this.totalElement = container.querySelector('.basket__price') as HTMLElement;
        this.buttonElement = container.querySelector('.basket__button') as HTMLButtonElement;

        if (this.buttonElement) {
            this.buttonElement.addEventListener('click', () => {
                this.events.emit('order:start');
            });
        }
    }

    set items(items: HTMLElement[]) {
        if (items.length) {
            this.listElement.replaceChildren(...items);
        } else {
            const emptyMessage = document.createElement('p');
            emptyMessage.textContent = 'Корзина пуста';
            this.listElement.replaceChildren(emptyMessage);
        }
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
}
