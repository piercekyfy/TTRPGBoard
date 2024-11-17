export interface ComponentEvent {
    // Typically a css selector string, but null will reference the Component's element.
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

    public destroy() {
        if(this.elm) {
            this.elm.remove();
        }
    }

    protected createElm(inner: string): HTMLElement {
        if(this.elm == null) {
            this.elm = document.createElement('div');
            this.elm.className = this.className;
        }

        this.elm.innerHTML = inner;
        
        this.events.forEach(event => {
            const elms = (event.selector ? (this.elm as HTMLElement).querySelectorAll(event.selector) : [this.elm as HTMLElement])
            for(const elm of elms) {
                elm.addEventListener(event.event, (e) => { event.action?.call(this, e); })
            }
        });

        return this.elm;
    }

    static simpleTemplateFill(template: string, map: { [s: string]: any }, delimiter: string = '%') {
        let filled = template;

        for(const [key, value] of Object.entries(map) ) {
            if(value instanceof Component) {
                const elm = value.render();

            }
            filled = filled.replace(delimiter + key + delimiter, value);
        }

        return filled;
    }
}