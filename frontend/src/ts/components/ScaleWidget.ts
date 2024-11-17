import { Component, ComponentEvent} from "./Component";
import { BoardElement } from "../board/elements";
import { BoardGraphics } from "../board";
import ToolList from "./ToolList";
import ElementWidget, { Widget } from "./ElementWidget";
import LeftArrowImage from "../../images/left-arrow.png";
import RightArrowImage from "../../images/right-arrow.png";

export default class ScaleWidget extends ElementWidget {
    override className: string = 'widget scale-widget';
    override template: string = `
    <div>
        <div class='scale-button s-btn-l'>
            <img src=${LeftArrowImage}>
        </div>
        <div class='scale-button s-btn-r'>
            <img src=${RightArrowImage}>
        </div>
    </div>`;
    protected override events: ComponentEvent[] = [];    

    public constructor(data: Widget) {
        super(data);
    }

    override render(): HTMLElement {
        return super.render();
    }
}