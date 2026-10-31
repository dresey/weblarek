import { Component } from '../base/Component';
import type { IEvents } from '../base/Events';

interface IPage {
    catalog: HTMLElement[];
    counter: number;
    locked: boolean;
}

export class Page extends Component<IPage> {
    protected catalogContainer: HTMLElement;
    protected basketButton: HTMLButtonElement;
    protected basketCounter: HTMLElement;
    protected pageWrapper: HTMLElement;

    constructor(container: HTMLElement, protected events: IEvents) {
        super(container);

        this.catalogContainer = container.querySelector('.gallery') as HTMLElement;
        this.basketButton = container.querySelector('.header__basket') as HTMLButtonElement;
        this.basketCounter = container.querySelector('.header__basket-counter') as HTMLElement;
        this.pageWrapper = container.querySelector('.page__wrapper') as HTMLElement;

        this.basketButton.addEventListener('click', () => {
            this.events.emit('basket:open');
        });
    }

    set catalog(items: HTMLElement[]) {
        this.catalogContainer.replaceChildren(...items);
    }

    set counter(value: number) {
        this.basketCounter.textContent = String(value);
    }

    set locked(value: boolean) {
        if (value) {
            this.pageWrapper.classList.add('page__wrapper_locked');
        } else {
            this.pageWrapper.classList.remove('page__wrapper_locked');
        }
    }
}
