export function pascalToKebab(value: string): string {
    return value.replace(/([a-z0–9])([A-Z])/g, "$1-$2").toLowerCase();
}

export function isSelector(value: unknown): value is string {
    return typeof value === 'string' && value.length > 1;
}

export function isEmpty(value: unknown): boolean {
    return value === null || value === undefined;
}

export type SelectorCollection<T extends Element> = string | NodeListOf<T> | T[];

export function ensureAllElements<T extends Element>(selector: SelectorCollection<T>, context: ParentNode = document): T[] {
    if (isSelector(selector)) {
        return Array.from(context.querySelectorAll<T>(selector));
    }
    if (selector instanceof NodeList) {
        return Array.from(selector) as T[];
    }
    if (Array.isArray(selector)) {
        return selector;
    }
    throw new Error('Unknown selector element');
}

export type SelectorElement<T extends Element> = T | string;

export function ensureElement<T extends HTMLElement>(selector: SelectorElement<T>, context?: ParentNode): T {
    if (isSelector(selector)) {
        const elements = ensureAllElements<T>(selector, context);
        if (elements.length > 1) {
            console.warn(`Selector ${selector} returned more than one element`);
        }
        if (elements.length === 0) {
            throw new Error(`Selector ${selector} returned no elements`);
        }
        return elements.pop() as T;
    }
    if (selector instanceof HTMLElement) {
        return selector as T;
    }
    throw new Error('Unknown selector element');
}

export function cloneTemplate<T extends HTMLElement>(query: string | HTMLTemplateElement): T {
    const templateElement = ensureElement<HTMLTemplateElement>(query);
    if (!templateElement.content.firstElementChild) {
        throw new Error(`Template ${query} has no content`);
    }
    return templateElement.content.firstElementChild.cloneNode(true) as T;
}

export function bem(block: string, element?: string, modifier?: string): { name: string, class: string } {
    let name = block;
    if (element) name += `__${element}`;
    if (modifier) name += `_${modifier}`;
    return {
        name,
        class: `.${name}`
    };
}

export function getObjectProperties(object: object, filter?: (name: string, descriptor: PropertyDescriptor) => boolean): string[] {
    return Object.entries(
        Object.getOwnPropertyDescriptors(
            Object.getPrototypeOf(object)
        )
    )
        .filter(([name, descriptor]: [string, PropertyDescriptor]) => filter ? filter(name, descriptor) : name !== 'constructor')
        .map(([name,]) => name);
}

export function setElementData(dataElement: HTMLElement, data: Record<string, unknown>): void {
    for (const key in data) {
        dataElement.dataset[key] = String(data[key]);
    }
}

export type DatasetSchema<T extends Record<string, unknown>> = {
    [Key in keyof T]: (value: string | undefined) => T[Key];
};

export function getElementData<T extends Record<string, unknown>>(dataElement: HTMLElement, schema: DatasetSchema<T>): T {
    const data: Partial<T> = {};
    for (const key in dataElement.dataset) {
        const schemaKey = key as keyof T;
        const convertValue = schema[schemaKey];
        data[schemaKey] = convertValue(dataElement.dataset[key]);
    }
    return data as T;
}

export function isPlainObject(value: unknown): value is Record<string, unknown> {
    if (value === null || typeof value !== 'object') {
        return false;
    }
    const prototype = Object.getPrototypeOf(value);
    return  prototype === Object.getPrototypeOf({}) ||
        prototype === null;
}

export function isBoolean(value: unknown): value is boolean {
    return typeof value === 'boolean';
}

export function createElement<
    T extends HTMLElement
    >(
    tagName: keyof HTMLElementTagNameMap,
    props?: Partial<Record<keyof T, string | boolean | object>>,
    children?: HTMLElement | HTMLElement []
): T {
    const element = document.createElement(tagName) as T;
    if (props) {
        for (const key in props) {
            const value = props[key];
            if (isPlainObject(value) && key === 'dataset') {
                setElementData(element, value);
            } else {
                Reflect.set(element, key, isBoolean(value) ? value : String(value));
            }
        }
    }
    if (children) {
        for (const child of Array.isArray(children) ? children : [children]) {
            element.append(child);
        }
    }
    return element;
}
