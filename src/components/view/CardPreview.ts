import { Card, ICard } from './Card';
import type { IEvents } from '../base/Events';
import { categoryMap, CDN_URL } from '../../utils/constants';
import { ensureElement } from '../../utils/utils';

export interface ICardPreview extends ICard {
    image: string;
    category: string;
    description: string;
    button: string;
    buttonDisabled?: boolean;
}

export class CardPreview extends Card<ICardPreview> {
    protected imageElement: HTMLImageElement;
    protected categoryElement: HTMLElement;
    protected descriptionElement: HTMLElement;
    public buttonElement: HTMLButtonElement;

    constructor(container: HTMLElement, events: IEvents) {
        super(container);

        this.imageElement = ensureElement<HTMLImageElement>('.card__image', container);
        this.categoryElement = ensureElement<HTMLElement>('.card__category', container);
        this.descriptionElement = ensureElement<HTMLElement>('.card__text', container);
        this.buttonElement = ensureElement<HTMLButtonElement>('.card__button', container);

        this.buttonElement.addEventListener('click', () => {
            events.emit('card:action');
        });
    }

    set image(value: string) {
        this.setImage(this.imageElement, CDN_URL + value);
    }

    set category(value: string) {
        this.categoryElement.textContent = value;
        const categoryClass = categoryMap[value as keyof typeof categoryMap];
        if (categoryClass) {
            this.categoryElement.className = 'card__category';
            this.categoryElement.classList.add(categoryClass);
        }
    }

    set description(value: string) {
        this.descriptionElement.textContent = value;
    }

    set button(value: string) {
        this.buttonElement.textContent = value;
    }

    set buttonDisabled(value: boolean) {
        this.buttonElement.disabled = value;
    }

    set price(value: number | null) {
        this.priceElement.textContent = value === null ? 'Бесценно' : `${value} синапсов`;
    }
}
