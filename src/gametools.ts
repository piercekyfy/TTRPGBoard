abstract class Tool {
    public abstract title: string;
    protected _game: Game;

    public constructor(game: Game) {
        this._game = game;
    }
    public abstract onMouseDown(e: MouseEvent, on: Selectable|null): void;
    public abstract onMouseMove(lastMousePos: [number, number], mousePos: [number, number]): void;
    public abstract onMouseUp(e: MouseEvent, on: Selectable|null): void;
    public abstract onWheel(e: WheelEvent): void;
    protected get selection(): Selectable[] {
        return this._game.selection;
    }
    protected get selected(): boolean {
        return this._game.selected;
    }
    protected get board(): Board {
        return this._game.board;
    }
}

class MoveTool extends Tool {
    public override title = "Move";
    protected _selected: Selectable|null = null;
    protected _dragSelection: boolean = false;
    protected _dragging: boolean = false;
    public onMouseDown(e: MouseEvent, on: Selectable|null): void {

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
    public onMouseMove(lastMousePos: [number, number], mousePos: [number, number]): void {
        if(!this._selected)
            return;
        
        this._dragging = true;

        if(this._dragging) {
            if(this._dragSelection){
                for(const selectable of this.selection) {
                    if(selectable == this._selected)
                        continue;
                    selectable.onDrag(lastMousePos, mousePos);
                }
            }
            this._selected.onDrag(lastMousePos, mousePos);
        }
    }
    public onMouseUp(e: MouseEvent, on: Selectable|null): void {
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

class SelectionTool extends MoveTool {
    private selectGraphic: BoardGraphic & {start: [number, number], end: [number, number]} = {
        start: [0,0],
        end: [0,0],
        render: function (graphics: BoardGraphicHelper): void {
            graphics.context.strokeRect(this.start[0], this.start[1], this.end[0] - this.start[0], this.end[1] - this.start[1])
        }
    }
    private _rectSelectStart: [number, number]|null = null;
    private _selectionMade: boolean = false;
    override onMouseDown(e: MouseEvent, on: Selectable | null): void {
        if(e.button != 0)
            return;

        if(this._selectionMade && on != null) {
            super.onMouseDown(e, on);
            return;
        } else {
            this._game.clearSelection();
        }
            
        this._rectSelectStart = [e.clientX, e.clientY];
        this.selectGraphic.start = this._rectSelectStart;
        this.selectGraphic.end = this._rectSelectStart;
        this.board.graphicLayer.addGraphic(this.selectGraphic);
    }
    override onMouseMove(lastMousePos: [number, number], mousePos: [number, number]): void {
        super.onMouseMove(lastMousePos, mousePos);

        if(this.selected)
            return;
        this.selectGraphic.end = mousePos;
        this.board.render();
    }
    override onMouseUp(e: MouseEvent, on: Selectable | null): void {
        if(e.button != 0 || !this._rectSelectStart)
            return;

        this.board.graphicLayer.removeGraphic(this.selectGraphic);
        const elms = this.board.elementsInRect(this._rectSelectStart[0], this._rectSelectStart[1], e.clientX - this._rectSelectStart[0], e.clientY - this._rectSelectStart[1]);
        for(const elm of elms) {
            this._game.select(elm);
        }
    }
}