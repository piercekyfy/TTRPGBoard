export interface ComponentEvent {
    selector: string|null,
    event: string,
    action: Function
}

export abstract class Component<T extends Object> {
    protected abstract readonly className: string;
    protected abstract readonly template: string;
    protected events: ComponentEvent[] = [];
    protected elm: HTMLElement|null = null;
    public data!: T;

    public constructor(data: T) {
        this.data = data;
    }

    abstract render(): HTMLElement;

    protected createElm(inner: string): HTMLElement {
        if(this.elm == null) {
            this.elm = document.createElement('div');
            this.elm.className = this.className;
        }

        this.elm.innerHTML = inner;

        this.events.forEach(event => {
            (event.selector ? this.elm?.querySelector(event.selector) : this.elm)?.addEventListener(event.event, () => { event.action?.call(this); })
        });

        return this.elm;
    }

    static simpleTemplateFill(template: string, map: { [s: string]: any }, delimiter: string = '%') {
        let filled = template;

        for(const [key, value] of Object.entries(map) ) {
            filled = filled.replace(delimiter + key + delimiter, value);
        }

        return filled;
    }
}