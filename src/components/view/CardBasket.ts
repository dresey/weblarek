import { Card } from './Card';
import type { IEvents } from '../base/Events';

export class CardBasket extends Card {
    constructor(container: HTMLElement, events: IEvents) {
        super(container, events);

        if (this.buttonElement) {
            this.buttonElement.addEventListener('click', () => {
                this.events.emit('card:remove', { id: this.id });
            });
        }
    }
}
