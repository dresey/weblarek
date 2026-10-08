type EventName = string | RegExp;
type EventCallback = (data: unknown) => void;
type EmitterEvent = {
    eventName: string,
    data: unknown
};

export interface IEvents {
    on<T extends object>(event: EventName, callback: (data: T) => void): void;
    emit<T extends object>(event: string, data?: T): void;
    trigger<T extends object>(event: string, context?: Partial<T>): (data: T) => void;
}

export class EventEmitter implements IEvents {
    private subscriptions: Map<EventName, Set<EventCallback>>;

    constructor() {
        this.subscriptions = new Map<EventName, Set<EventCallback>>();
    }

    on<T extends object>(eventName: EventName, callback: (data: T) => void): void {
        if (!this.subscriptions.has(eventName)) {
            this.subscriptions.set(eventName, new Set<EventCallback>());
        }
        this.subscriptions.get(eventName)?.add(callback as EventCallback);
    }

    off(eventName: EventName, callback: EventCallback): void {
        if (this.subscriptions.has(eventName)) {
            this.subscriptions.get(eventName)?.delete(callback);
            if (this.subscriptions.get(eventName)?.size === 0) {
                this.subscriptions.delete(eventName);
            }
        }
    }

    emit<T extends object>(eventName: string, data?: T): void {
        this.subscriptions.forEach((callbacks, subscriptionName) => {
            if (subscriptionName === '*') callbacks.forEach((callback) => callback({
                eventName,
                data
            }));
            if ((subscriptionName instanceof RegExp && subscriptionName.test(eventName)) || subscriptionName === eventName) {
                callbacks.forEach((callback) => callback(data));
            }
        });
    }

    onAll(callback: (event: EmitterEvent) => void): void {
        this.on('*', callback);
    }

    offAll(): void {
        this.subscriptions = new Map<EventName, Set<EventCallback>>();
    }

    trigger<T extends object>(eventName: string, context?: Partial<T>): (data: T) => void {
        return (event: object = {}) => {
            this.emit(eventName, {
                ...(event || {}),
                ...(context || {})
            });
        };
    }
}
