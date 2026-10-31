import { Component } from '../base/Component';
import type { IEvents } from '../base/Events';

interface ISuccess {
    total: number;
}

export class Success extends Component<ISuccess> {
    protected closeButton: HTMLButtonElement;
    protected descriptionElement: HTMLElement;

    constructor(container: HTMLElement, protected events: IEvents) {
        super(container);

        this.closeButton = container.querySelector('.order-success__close') as HTMLButtonElement;
        this.descriptionElement = container.querySelector('.order-success__description') as HTMLElement;

        this.closeButton.addEventListener('click', () => {
            this.events.emit('success:close');
        });
    }

    set total(value: number) {
        this.descriptionElement.textContent = `Списано ${value} синапсов`;
    }
}
