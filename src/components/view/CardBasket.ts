import { Card, ICard } from './Card';
import { ensureElement } from '../../utils/utils';

export interface ICardBasket extends ICard {
    index: number;
}

export class CardBasket extends Card<ICardBasket> {
    protected indexElement: HTMLElement;
    protected buttonElement: HTMLButtonElement;

    constructor(container: HTMLElement, onRemove: () => void) {
        super(container);

        this.indexElement = ensureElement<HTMLElement>('.basket__item-index', container);
        this.buttonElement = ensureElement<HTMLButtonElement>('.card__button', container);

        this.buttonElement.addEventListener('click', onRemove);
    }

    set index(value: number) {
        this.indexElement.textContent = String(value);
    }
}
