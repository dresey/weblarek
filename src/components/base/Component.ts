export abstract class Component<T> {
    protected constructor(protected readonly container: HTMLElement) {}

    protected setImage(element: HTMLImageElement, source: string, alternativeText?: string): void {
        element.src = source;
        if (alternativeText) {
            element.alt = alternativeText;
        }
    }

    render(data?: Partial<T>): HTMLElement {
        Object.assign(this as object, data ?? {});
        return this.container;
    }
}
