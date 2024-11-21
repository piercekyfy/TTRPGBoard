import { Component, ComponentEvent } from "./Component";
import ElementWidget, { WidgetData } from "./ElementWidget";

type TitleWidgetData = WidgetData & {
    default: string,
    editable: boolean 
}

export default class TitleWidget extends ElementWidget<TitleWidgetData> {
    override className: string = 'widget title-widget';
    override template: string = `
    <div>
        <input type='text' class='title-input'>
    </div>`;
    protected override events: ComponentEvent[] = [{selector: '.title-input', event: 'input', action: this.onInput}, {selector: '.title-input', event: 'change', action: this.onInputChange}];

    private titleInputElm: HTMLInputElement|null = null

    override render(): HTMLElement {
        const elm = this.createElm(Component.simpleTemplateFill(this.template, {}));

        this.titleInputElm = elm.querySelector('input') as HTMLInputElement;

        if(this.titleInputElm) {
            this.titleInputElm.value = this.data.parent.title == '' ? this.data.default : this.data.parent.title;
            this.onInput();
        }

        this.titleInputElm.disabled = !this.data.editable;

        return elm;
    }

    private setTitle(title: string) {
        this.data.parent.title = title;
        this.render();
    }

    private onInput() {
        console.log('on inpuit');
        if(this.titleInputElm) {
            this.titleInputElm.style.width = (this.titleInputElm.value.length < 3 ? 3 : this.titleInputElm.value.length) + 'ch';
        }
    }

    private onInputChange() {
        if(this.titleInputElm) {
            this.setTitle(this.titleInputElm.value);
        }
            
    }
}