import { Card } from './Card';
import type { IEvents } from '../base/Events';

export class CardPreview extends Card {
    constructor(container: HTMLElement, events: IEvents) {
        super(container, events);

        if (this.buttonElement) {
            this.buttonElement.addEventListener('click', () => {
                this.events.emit('card:action', { id: this.id });
            });
        }
    }
}
