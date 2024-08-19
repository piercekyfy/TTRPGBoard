import { Board, BoardGraphics } from '../board';
import { SelectableElement, BoardElement, GraphicElement } from '../board/elements';
import { Tool, MoveTool, DrawTool } from './tools';

export default class Game {
    public currentTool: Tool = new DrawTool(this);
    public snapToGrid: boolean = true;
    private _board: Board;
    private _selection: SelectableElement[] = [];
    private _lastMousePos: [number, number] = [0,0];
    private _performScrollDrag: boolean = false;
    private _outlinesGraphic = {
        tag: 'selected_outline',
        render: function (graphics: BoardGraphics, caller?: BoardElement): void {
            if(!caller)
                return;
            graphics.context.strokeStyle = "red";
            graphics.context.lineWidth = 2;
            graphics.drawDebugBorderOn(caller as SelectableElement);
            graphics.context.strokeStyle = "black";
            graphics.context.lineWidth = 1;
        }
    }

    public constructor(board: Board) {
        this._board = board;
    }
    public select(selectable: SelectableElement|null) {
        if(selectable === null)
            this.clearSelection();
        else if (!this._selection.includes(selectable) && selectable.onSelected()) {
            this._selection.push(selectable);
            GraphicElement.attachTo(selectable, this._outlinesGraphic.render, this._outlinesGraphic.tag);
        }
    }
    public deselect(selectable: SelectableElement) {
        for(let i = 0; i < this._selection.length; i++) {
            if(selectable === this._selection[i] && this._selection[i].onDeselected()) {
                this._selection[i].removeGraphicByTag(this._outlinesGraphic.tag);
                this._selection.splice(i, 1);
                return;
            }
        }
    }
    public clearSelection() {
        // Slower than looping once here but ensures that deselect is always called when an element is removed from the selection.
        const selection = Array.from(this.selection);
        for(const selectable of selection) {
            this.deselect(selectable); 
        }
    }
    private onScrollDrag(mousePos: [number, number]) {
        this._board.xOffset += (mousePos[0] - this._lastMousePos[0]) / this._board.scale;
        this._board.yOffset += (mousePos[1] - this._lastMousePos[1]) / this._board.scale;
    }
    public onAnimFrame() {
        this.board.render();
    }
    public onKeyUp(e: KeyboardEvent) {
        this.currentTool.onKeyUp(e);
    }
    public onMouseDown(e: MouseEvent) {
        const elm = this._board.getTopElementAt(e.clientX, e.clientY);

        if (e.button == 1) {
            this._performScrollDrag = true;
        }

        this.currentTool.onMouseDown(e, elm);
    }
    public onMouseMove(e: MouseEvent) {
        const mousePos: [number, number] = [e.clientX, e.clientY];

        if(mousePos != this._lastMousePos) {
            if(this._performScrollDrag) {
                this.onScrollDrag(mousePos);
            } else {
                this.currentTool.onMouseMove(e, this._lastMousePos);
            }
        }   

        this._lastMousePos = mousePos;
    }
    public onMouseUp(e: MouseEvent) {
        const elm = this._board.getTopElementAt(e.clientX, e.clientY);

        if(e.button == 1 && this._performScrollDrag){
            this._performScrollDrag = false;
        }

        this.currentTool.onMouseUp(e, elm);
    }
    public onWheel(e: WheelEvent) {
        const dir = -Math.sign(e.deltaY);

        const scale = this._board.scale;
            
        let speed = 0.1;

        if((scale + speed >= 3.5 && dir > 0) || (scale - speed <= 0.5 && dir < 0)) 
            speed = 0;

        this._board.scale += speed * dir;

        this.currentTool.onWheel(e);
    }
    public get board(): Board {
        return this._board;
    }
    public get selection(): SelectableElement[] {
        return Array.from(this._selection);
    }
    public get selected(): boolean {
        return this._selection.length != 0;
    }
}