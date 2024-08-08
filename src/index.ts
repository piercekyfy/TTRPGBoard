const imgEdwin: HTMLImageElement = document.getElementById('img-edwin') as HTMLImageElement;
const canvas: HTMLCanvasElement = document.getElementById('game') as HTMLCanvasElement;

const board: Board = new Board(canvas, document.documentElement.clientWidth, document.documentElement.clientHeight);

board.render();

let token = board.createToken(1, 64,64, imgEdwin, 64, 64);
let token2 = board.createToken(2, 128,64, imgEdwin, 128, 128);
let token3 = board.createToken(1, 32,64, imgEdwin, 64, 64);

class Game {
    public snapToGrid: boolean = true;
    private _board: Board;
    private _selected: Selectable|null = null;
    private _lastMousePos: [number, number] = [0,0];
    private _performDrag: boolean = false;
    private _performScrollDrag: boolean = false;
    public constructor(board: Board) {
        this._board = board;
    }
    public select(element: Selectable|null) {
        const last = this._selected;
        this._selected = element;
        this.onSelected(last, this._selected);
        element?.onSelected(last);
    }
    // The element is initally selected here.
    private onSelected(last: Selectable|null, selected: Selectable|null) {
        if(!selected)
            return;
        
        this._performDrag = true;
    }
    private onDragSelected(mousePos: [number, number]) {
        if(this._selected){
            this._selected.onDrag(this._lastMousePos, mousePos);
        }
    }
    // A selected element has stopped being dragged. This is where any additional operations should take place.
    private onDragSelectedEnd() {
        if(!this._selected)
            return;

        if(this.snapToGrid) {
            this._selected.x = Math.round(this._selected.x / this._board.cellSize) * this._board.cellSize;
            this._selected.y = Math.round(this._selected.y / this._board.cellSize) * this._board.cellSize;
        }

    }
    private onScrollDrag(mousePos: [number, number]) {
        this._board.xOffset += (mousePos[0] - this._lastMousePos[0]) / this._board.scale;
        this._board.yOffset += (mousePos[1] - this._lastMousePos[1]) / this._board.scale;
    }
    public onMouseDown(e: MouseEvent) {
        if(e.button == 0) {
            this.select(board.getTopElementAt(e.clientX, e.clientY));
        } else if (e.button == 1) {
            this._performScrollDrag = true;
        }
    }
    public onMouseMove(e: MouseEvent) {
        const mousePos: [number, number] = [e.clientX, e.clientY];

        if(mousePos != this._lastMousePos) {
            if(this._performScrollDrag) {
                this.onScrollDrag(mousePos);
            } else if (this._performDrag) {
                this.onDragSelected(mousePos);
            }
        }   

        this._lastMousePos = mousePos;
    }
    public onMouseUp(e: MouseEvent) {
        if(e.button == 0 && this._performDrag) {
            this._performDrag = false;
            this.onDragSelectedEnd();
        }
        else if(e.button == 1 && this._performScrollDrag){
            this._performScrollDrag = false;
        }
    }
    // This can definitely use a lot of cleanup but it's functional.
    public onWheel(e: WheelEvent) {

        const dir = -Math.sign(e.deltaY);

        if(this._selected && this._performDrag) {
            const newWidth = this._selected.width + this._board.cellSize * -dir;
            const newHeight = this._selected.height + this._board.cellSize * -dir;

            if(newWidth < this._board.cellSize || newHeight < this._board.cellSize)
                return;
            
            this._selected.x = (this._selected.x - (newWidth - this._selected.width) * 0.5);
            this._selected.y = (this._selected.y - (newWidth - this._selected.height) * 0.5);

            this._selected.width = newWidth;
            this._selected.height = newHeight;
        } else {
            const scale = this._board.scale;
            
            let speed = 0.1;

            if((scale + speed >= 3.5 && dir > 0) || (scale - speed <= 0.5 && dir < 0)) 
                speed = 0;

            this._board.scale += speed * dir;
        }
    }
}

const game = new Game(board);

document.addEventListener("mousedown", (e: MouseEvent) => { game.onMouseDown(e) });
document.addEventListener("mousemove", (e: MouseEvent) => { game.onMouseMove(e) });
document.addEventListener("mouseup",   (e: MouseEvent) => { game.onMouseUp(e)   });
document.addEventListener("wheel",     (e: WheelEvent) => { game.onWheel(e)   });