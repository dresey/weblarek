import { Component } from '../base/Component';
import type { IEvents } from '../base/Events';
import { ensureElement } from '../../utils/utils';

interface IModal {
    content: HTMLElement;
}

export class Modal extends Component<IModal> {
    protected closeButton: HTMLButtonElement;
    protected contentContainer: HTMLElement;

    constructor(container: HTMLElement, protected events: IEvents) {
        super(container);

        this.closeButton = ensureElement<HTMLButtonElement>('.modal__close', container);
        this.contentContainer = ensureElement<HTMLElement>('.modal__content', container);

        this.closeButton.addEventListener('click', this.close.bind(this));
        container.addEventListener('click', this.handleOverlayClick.bind(this));
        this.contentContainer.addEventListener('click', (event) => event.stopPropagation());
    }

    set content(value: HTMLElement) {
        this.contentContainer.replaceChildren(value);
    }

    open(): void {
        this.container.classList.add('modal_active');
    }

    close(): void {
        this.container.classList.remove('modal_active');
        this.contentContainer.replaceChildren();
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
