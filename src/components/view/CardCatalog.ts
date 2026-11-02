import { Card, ICard } from './Card';
import { categoryMap, CDN_URL } from '../../utils/constants';
import { ensureElement } from '../../utils/utils';

export interface ICardCatalog extends ICard {
    image: string;
    category: string;
}

export class CardCatalog extends Card<ICardCatalog> {
    protected imageElement: HTMLImageElement;
    protected categoryElement: HTMLElement;

    constructor(container: HTMLElement, onClick: () => void) {
        super(container);

        this.imageElement = ensureElement<HTMLImageElement>('.card__image', container);
        this.categoryElement = ensureElement<HTMLElement>('.card__category', container);

        container.addEventListener('click', onClick);
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
}
