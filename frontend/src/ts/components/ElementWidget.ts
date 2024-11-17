import { Component, ComponentEvent} from "./Component";
import { BoardElement } from "../board/elements";
import { BoardGraphics } from "../board";
import ToolList from "./ToolList";

export type Widget = {
    parent: BoardElement,
}

export default abstract class ElementWidget<T extends Widget = Widget> extends Component<T> {
    override className: string = 'widget';
    override template: string = "";
    protected override events: ComponentEvent[] = [];
    private attachment = {tag: this.constructor.name, render: this.onElementRender.bind(this)}

    public constructor(data: T) {
        super(data);
        data.parent.attachGraphic(this.attachment);
    }

    override render(): HTMLElement {
        const elm = this.createElm(Component.simpleTemplateFill(this.template, {}));

        elm.style.left = this.data.parent.virtualX.toString() + 'px';
        elm.style.top = this.data.parent.virtualY.toString() + 'px';
        elm.style.width = this.data.parent.virtualWidth.toString() + 'px';
        elm.style.height = this.data.parent.virtualHeight.toString() + 'px';

        return elm;
    }

    private updatePosition() {
        if(!this.elm)
            return;
        
    }

    private onElementRender(graphics: BoardGraphics) {
        this.render();
    }
}