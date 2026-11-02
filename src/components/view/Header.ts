import { Component } from '../base/Component';
import type { IEvents } from '../base/Events';
import { ensureElement } from '../../utils/utils';

interface IHeader {
    counter: number;
}

export class Header extends Component<IHeader> {
    protected basketButton: HTMLButtonElement;
    protected basketCounter: HTMLElement;

    constructor(container: HTMLElement, protected events: IEvents) {
        super(container);

        this.basketButton = ensureElement<HTMLButtonElement>('.header__basket', container);
        this.basketCounter = ensureElement<HTMLElement>('.header__basket-counter', container);

        this.basketButton.addEventListener('click', () => {
            this.events.emit('basket:open');
        });
    }

    set counter(value: number) {
        this.basketCounter.textContent = String(value);
    }
}
