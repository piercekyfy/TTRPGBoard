import Tool from './Tool';
import { SelectableElement } from '../../board/elements';

export default class MoveTool extends Tool {
    public override title = "Move";
    protected _selected: SelectableElement|null = null;
    protected _dragSelection: boolean = false;
    protected _dragging: boolean = false;
    public onMouseDown(e: MouseEvent, on: SelectableElement|null): void {

        if(e.button != 0)
            return;

        if(on == null)
            this._game.clearSelection();
        else if(!this.selection.includes(on) && !e.shiftKey)
            this._game.clearSelection();

        if(on != null) {
            this._selected = on;

            if(e.shiftKey || this.selection.includes(on))
                this._dragSelection = true;
        }
    }
    public onMouseMove(e: MouseEvent, lastMousePos: [number, number]): void {
        if(!this._selected)
            return;
        
        this._dragging = true;

        if(this._dragging) {
            if(this._dragSelection){
                for(const selectable of this.selection) {
                    if(selectable == this._selected)
                        continue;
                    selectable.onDrag(lastMousePos, [e.clientX, e.clientY]);
                }
            }
            this._selected.onDrag(lastMousePos, [e.clientX, e.clientY]);
        }
    }
    public onMouseUp(e: MouseEvent, on: SelectableElement|null): void {
        if(e.button != 0 || this._selected == null)
            return;

        if(!this._dragging) {
            if(!e.shiftKey) {
                this._game.clearSelection();
            }
            this._game.select(this._selected);
        }
            

        if(this._dragging && this._game.snapToGrid) {
            if(this._dragSelection) {
                for(const selectable of this.selection) {
                    selectable.x = Math.round(selectable.x / this.board.cellSize) * this.board.cellSize;
                    selectable.y = Math.round(selectable.y / this.board.cellSize) * this.board.cellSize;
                }
            }
            this._selected.x = Math.round(this._selected.x / this.board.cellSize) * this.board.cellSize;
            this._selected.y = Math.round(this._selected.y / this.board.cellSize) * this.board.cellSize;
        }

        this._selected = null;
        this._dragging = false;
        this._dragSelection = false;
    }
    // TODO: Scale selection on wheel.
    public onWheel(e: WheelEvent): void {}
}