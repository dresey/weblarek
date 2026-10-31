import { Component } from '../base/Component';
import type { IEvents } from '../base/Events';
import type { IStoreProduct } from '../../types';
import { categoryClassNames, CONTENT_BASE_URL } from '../../utils/constants';

interface ICard extends IStoreProduct {
    index?: number;
    button?: string;
}

export abstract class Card extends Component<ICard> {
    protected titleElement?: HTMLElement;
    protected imageElement?: HTMLImageElement;
    protected categoryElement?: HTMLElement;
    protected priceElement?: HTMLElement;
    public buttonElement?: HTMLButtonElement;
    protected descriptionElement?: HTMLElement;
    protected indexElement?: HTMLElement;

    constructor(container: HTMLElement, protected events: IEvents) {
        super(container);

        this.titleElement = container.querySelector('.card__title') as HTMLElement;
        this.imageElement = container.querySelector('.card__image') as HTMLImageElement;
        this.categoryElement = container.querySelector('.card__category') as HTMLElement;
        this.priceElement = container.querySelector('.card__price') as HTMLElement;
        this.buttonElement = container.querySelector('.card__button') as HTMLButtonElement;
        this.descriptionElement = container.querySelector('.card__text') as HTMLElement;
        this.indexElement = container.querySelector('.basket__item-index') as HTMLElement;
    }

    set id(value: string) {
        this.container.dataset.id = value;
    }

    get id(): string {
        return this.container.dataset.id || '';
    }

    set title(value: string) {
        if (this.titleElement) {
            this.titleElement.textContent = value;
        }
    }

    set image(value: string) {
        if (this.imageElement) {
            this.setImage(this.imageElement, CONTENT_BASE_URL + value);
        }
    }

    set category(value: string) {
        if (this.categoryElement) {
            this.categoryElement.textContent = value;
            const categoryClass = categoryClassNames[value as keyof typeof categoryClassNames];
            if (categoryClass) {
                this.categoryElement.className = 'card__category';
                this.categoryElement.classList.add(categoryClass);
            }
        }
    }

    set price(value: number | null) {
        if (this.priceElement) {
            this.priceElement.textContent = value !== null ? `${value} синапсов` : 'Бесценно';
        }
        if (this.buttonElement && value === null) {
            this.buttonElement.disabled = true;
        }
    }

    set description(value: string) {
        if (this.descriptionElement) {
            this.descriptionElement.textContent = value;
        }
    }

    set button(value: string) {
        if (this.buttonElement) {
            this.buttonElement.textContent = value;
        }
    }

    set index(value: number) {
        if (this.indexElement) {
            this.indexElement.textContent = String(value);
        }
    }
}
