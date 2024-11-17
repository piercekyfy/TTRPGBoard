import { Component, ComponentEvent} from "./Component";
import { BoardElement } from "../board/elements";
import { BoardGraphics } from "../board";
import ToolList from "./ToolList";
import ElementWidget, { Widget } from "./ElementWidget";
import LeftArrowImage from "../../images/left-arrow.png";
import RightArrowImage from "../../images/right-arrow.png";

enum ButtonDir {
    L = -1,
    R = 1
}

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
    protected override events: ComponentEvent[] = [
        {selector: '.scale-button', event: 'mousedown', action: this.onDragStart}];    
    private dragging: ButtonDir|null = null;
    private lastMouseX: number = 0;

    public constructor(data: Widget) {
        super(data);
        if(this.dragging != null)
            this.onDragEnd();
    }

    public override destroy(): void {
        super.destroy();
    }

    private onDragStart(e: MouseEvent) {
        if(e.button != 0)
            return;
        
        if(e.target) {
            this.lastMouseX = e.clientX;

            if((e.target as HTMLElement).classList.contains('s-btn-l')) {
                this.dragging = ButtonDir.L;
            } else {
                this.dragging = ButtonDir.R;
            }
            document.addEventListener("mousemove", this.onDrag.bind(this));
            document.addEventListener("mouseup", this.onDragEnd.bind(this));
        } else {
            this.onDragEnd();
        }
    }

    private onDrag(e: MouseEvent) {
        if(this.dragging != null) {
            this.data.parent.width += (e.clientX - this.lastMouseX) / this.data.parent.layer.board.scale;
        }
        this.lastMouseX = e.clientX;
    }

    private onDragEnd() {
        this.dragging = null;
        document.removeEventListener("mousemove", this.onDrag);
        document.removeEventListener("mouseup", this.onDragEnd);

        // Snap to grid

        this.data.parent.width = Math.round(this.data.parent.width / this.data.parent.layer.board.cellSize) * this.data.parent.layer.board.cellSize
    }

    override render(): HTMLElement {
        return super.render();
    }
}