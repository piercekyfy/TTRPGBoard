import MoveTool from "./MoveTool";
import { BoardGraphics } from "../../board";
import { SelectableElement, GraphicElement } from "../../board/elements";


export default class SelectionTool extends MoveTool {
    override title: string = "Selection";
    private selectGraphic = {
        start: [0,0],
        end: [0,0],
        render: (graphics: BoardGraphics): void => {
            graphics.context.strokeRect(this.selectGraphic.start[0], this.selectGraphic.start[1], this.selectGraphic.end[0] - this.selectGraphic.start[0], this.selectGraphic.end[1] - this.selectGraphic.start[1])
        }
    }
    private selectGraphicInstance: GraphicElement|null = null;
    private _rectSelectStart: [number, number]|null = null;
    private _selectionMade: boolean = false;
    override onMouseDown(e: MouseEvent, on: SelectableElement | null): void {
        if(e.button != 0)
            return;

        if(this._selectionMade && on != null) {
            super.onMouseDown(e, on);
            return;
        } else {
            this._game.clearSelection();
            this._selectionMade = false;
        }
            
        this._rectSelectStart = [e.clientX, e.clientY];
        this.selectGraphic.start = this._rectSelectStart;
        this.selectGraphic.end = this._rectSelectStart;

        this.selectGraphicInstance = new GraphicElement(this.board.graphicLayer, this.selectGraphic.start[0], this.selectGraphic.start[1], this.selectGraphic.render);
        this.board.graphicLayer.addElement(this.selectGraphicInstance);
    }
    override onMouseMove(e: MouseEvent, lastMousePos: [number, number]): void {
        super.onMouseMove(e, lastMousePos);

        if(this.selected)
            return;
        this.selectGraphic.end = [e.clientX, e.clientY];
    }
    override onMouseUp(e: MouseEvent, on: SelectableElement | null): void {
        super.onMouseUp(e, on);
        if(e.button != 0 || !this._rectSelectStart)
            return;
        
        this.selectGraphicInstance?.destroy();
        const elms = this.board.elementsInRect(this._rectSelectStart[0], this._rectSelectStart[1], e.clientX - this._rectSelectStart[0], e.clientY - this._rectSelectStart[1]);
        for(const elm of elms) {
            this._game.select(elm);
        }
        this._selectionMade = true;
    }
}