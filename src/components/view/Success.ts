import { Component } from '../base/Component';
import type { IEvents } from '../base/Events';
import { ensureElement } from '../../utils/utils';

interface ISuccess {
    total: number;
}

export class Success extends Component<ISuccess> {
    protected closeButton: HTMLButtonElement;
    protected descriptionElement: HTMLElement;

    constructor(container: HTMLElement, protected events: IEvents) {
        super(container);

        this.closeButton = ensureElement<HTMLButtonElement>('.order-success__close', container);
        this.descriptionElement = ensureElement<HTMLElement>('.order-success__description', container);

        this.closeButton.addEventListener('click', () => {
            this.events.emit('success:close');
        });
    }

    set total(value: number) {
        this.descriptionElement.textContent = `Списано ${value} синапсов`;
    }

    getContainer(): HTMLElement {
        return super.render();
    }
}
