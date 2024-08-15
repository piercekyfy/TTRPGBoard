const imgEdwin: HTMLImageElement = document.getElementById('img-edwin') as HTMLImageElement;
const canvas: HTMLCanvasElement = document.getElementById('game') as HTMLCanvasElement;

const board: Board = new Board(canvas, document.documentElement.clientWidth, document.documentElement.clientHeight);

board.render();

let token = board.createToken(1, 64,64, imgEdwin, 64, 64);
let token2 = board.createToken(2, 128,64, imgEdwin, 128, 128);
let token3 = board.createToken(1, 32,64, imgEdwin, 64, 64);

class Game {
    public currentTool: Tool = new MoveTool(this);
    public snapToGrid: boolean = true;
    private _board: Board;
    private _selection: Selectable[] = [];
    private _lastMousePos: [number, number] = [0,0];
    private _performScrollDrag: boolean = false;
    private _outlinesGraphic: BoardGraphic = {
        render: function (graphics: BoardGraphicHelper, caller: BoardElement): void {
            graphics.context.strokeStyle = "red";
            graphics.context.lineWidth = 2;
            graphics.drawDebugBorderOn(caller);
            graphics.context.strokeStyle = "black";
            graphics.context.lineWidth = 1;
        }
    }

    public constructor(board: Board) {
        this._board = board;
    }
    public select(selectable: Selectable|null) {
        if(selectable === null)
            this.clearSelection();
        else if (!this._selection.includes(selectable) && selectable.onSelected()) {
            console.log("selected: " + selectable + " at " + selectable.x);
            this._selection.push(selectable);
            selectable.attachGraphic(this._outlinesGraphic);
        }
        this.board.render();
    }
    public deselect(selectable: Selectable) {
        for(let i = 0; i < this._selection.length; i++) {
            if(selectable === this._selection[i] && this._selection[i].onDeselected()) {
                console.log(selectable.x);
                this._selection[i].removeGraphic(this._outlinesGraphic);
                this._selection.splice(i, 1);
            }
        }
        this.board.render();
    }
    public clearSelection() {
        // Slower than looping once here but ensures that deselect is always called when an element is removed from the selection.
        const selection = Array.from(this.selection);
        for(const selectable of selection) {
            console.log("Deselecting: " + selectable.x);
            this.deselect(selectable); 
        }
        console.log(this._selection);
    }
    private onScrollDrag(mousePos: [number, number]) {
        this._board.xOffset += (mousePos[0] - this._lastMousePos[0]) / this._board.scale;
        this._board.yOffset += (mousePos[1] - this._lastMousePos[1]) / this._board.scale;
    }
    public onMouseDown(e: MouseEvent) {
        const elm = board.getTopElementAt(e.clientX, e.clientY);

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
                this.currentTool.onMouseMove(this._lastMousePos, mousePos);
            }
        }   

        this._lastMousePos = mousePos;
    }
    public onMouseUp(e: MouseEvent) {
        const elm = board.getTopElementAt(e.clientX, e.clientY);

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
    public get selection(): Selectable[] {
        return Array.from(this._selection);
    }
    public get selected(): boolean {
        return this._selection.length != 0;
    }
}

const game = new Game(board);

document.addEventListener("mousedown", (e: MouseEvent) => { game.onMouseDown(e) });
document.addEventListener("mousemove", (e: MouseEvent) => { game.onMouseMove(e) });
document.addEventListener("mouseup",   (e: MouseEvent) => { game.onMouseUp(e)   });
document.addEventListener("wheel",     (e: WheelEvent) => { game.onWheel(e)   });