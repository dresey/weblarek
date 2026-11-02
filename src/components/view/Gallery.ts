import { Component } from '../base/Component';

interface IGallery {
    items: HTMLElement[];
}

export class Gallery extends Component<IGallery> {
    constructor(container: HTMLElement) {
        super(container);
    }

    set items(value: HTMLElement[]) {
        this.container.replaceChildren(...value);
    }
}
