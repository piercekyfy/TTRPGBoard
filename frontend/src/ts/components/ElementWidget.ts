import { Component, ComponentEvent} from "./Component";
import { BoardElement } from "../board/elements";
import { BoardGraphics } from "../board";
import ToolList from "./ToolList";

export type WidgetData = {
    parent: BoardElement,
}

export default abstract class ElementWidget<T extends WidgetData = WidgetData> extends Component<T> {
    private attachment = {tag: this.constructor.name, render: this.onElementRender.bind(this)}

    public constructor(data: T) {
        super(data);
        data.parent.attachGraphic(this.attachment);
    }
    
    protected onElementRender(graphics: BoardGraphics) {
        if(this.elm) {
            this.elm.style.left = this.data.parent.virtualX.toString() + 'px';
            this.elm.style.top = this.data.parent.virtualY.toString() + 'px';
            this.elm.style.width = this.data.parent.virtualWidth.toString() + 'px';
            this.elm.style.height = this.data.parent.virtualHeight.toString() + 'px';
        }
    }
}