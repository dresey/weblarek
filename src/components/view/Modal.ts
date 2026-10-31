import { Component } from '../base/Component';
import type { IEvents } from '../base/Events';

interface IModal {
    content: HTMLElement;
}

export class Modal extends Component<IModal> {
    protected closeButton: HTMLButtonElement;
    protected contentContainer: HTMLElement;

    constructor(container: HTMLElement, protected events: IEvents) {
        super(container);

        this.closeButton = container.querySelector('.modal__close') as HTMLButtonElement;
        this.contentContainer = container.querySelector('.modal__content') as HTMLElement;

        this.closeButton.addEventListener('click', this.close.bind(this));
        this.container.addEventListener('click', this.handleOverlayClick.bind(this));
        this.contentContainer.addEventListener('click', (event) => event.stopPropagation());
    }

    set content(value: HTMLElement) {
        this.contentContainer.replaceChildren(value);
    }

    open(): void {
        this.container.classList.add('modal_active');
        this.events.emit('modal:opened');
    }

    close(): void {
        this.container.classList.remove('modal_active');
        this.content = document.createElement('div');
        this.events.emit('modal:closed');
    }

    protected handleOverlayClick(): void {
        this.close();
    }

    render(data: IModal): HTMLElement {
        super.render(data);
        this.open();
        return this.container;
    }
}
