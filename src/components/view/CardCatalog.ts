import { Card } from './Card';
import type { IEvents } from '../base/Events';

export class CardCatalog extends Card {
    constructor(container: HTMLElement, events: IEvents) {
        super(container, events);

        this.container.addEventListener('click', () => {
            this.events.emit('card:select', { id: this.id });
        });
    }
}
