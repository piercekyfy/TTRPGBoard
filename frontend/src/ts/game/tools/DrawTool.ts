import { BoardElement, DrawingElement } from '../../board/elements';
import Tool from './Tool';
import CursorImage from '../../../images/palm.png';

export enum DrawMode {
    Paint = 0
}

export class DrawEvent {
    public constructor(public mouseEvent: MouseEvent|null, public lastMousePos: [number, number]) {}
    public get mousePos() { return this.mouseEvent ? [this.mouseEvent.clientX, this.mouseEvent.clientY] : [NaN, NaN] };
}

export default class DrawTool extends Tool {
    public override title: string = "Draw";
    public override imageURL: string = CursorImage;
    public mode: DrawMode = DrawMode.Paint;
    private initialBegin = false;
    private drawing = false;
    private selectedDrawing: DrawingElement|null = null;
    private mouseUp: boolean = true;
    public onKeyUp(e: KeyboardEvent): void {
        if((e.key == 'c' || e.key == 'C') && this.drawing && this.selectedDrawing) {
            this.closePath();
            this.onDrawEnd();
        }
    }
    public onMouseDown(e: MouseEvent, on: BoardElement | null): void {
        if(e.button != 0)
            return;

        if(this.drawing && this.selectedDrawing && e.shiftKey) {
            this.addPointToSelected(e.clientX, e.clientY);
        } else if (!this.drawing) {
            this.initialBegin = true;
        }
        this.mouseUp = false;
    }
    public onMouseMove(e: MouseEvent, lastMousePos: [number, number]): void {
        if(this.drawing && !e.shiftKey && this.mouseUp) {
            this.onDrawEnd();
        }
        if(this.drawing && !e.shiftKey) {
            this.onDraw(new DrawEvent(e, lastMousePos));
        }
        else if(this.initialBegin) {
            this.drawing = true;
            this.initialBegin = false;
            this.onDrawBegin(new DrawEvent(e, lastMousePos));
        }
    }
    public onMouseUp(e: MouseEvent, on: BoardElement| null): void {
        if(e.button != 0)
            return;

        if(this.drawing) {
            this.mouseUp = true;
        } else if (this.drawing) {
            this.onDrawEnd();
        }
    }
    public onWheel(e: WheelEvent): void {}
    private onDrawBegin(e: DrawEvent) {
        this.selectedDrawing = this.board.createDrawing(this.board.graphicLayer.z, [e.mousePos[0], e.mousePos[1]]);
        this._game.clearSelection();
        this._game.select(this.selectedDrawing);
    }
    private onDraw(e: DrawEvent) {
        this.addPointToSelected(e.lastMousePos[0], e.lastMousePos[1]);
    }
    private onDrawEnd() {
        this.drawing = false;
        this.selectedDrawing = null;
    }
    private addPointToSelected(x: number, y: number) {
        if(!this.selectedDrawing)
            return;

        this.selectedDrawing?.addToPath([x,  y]);
    }
    private closePath() {
        if(this.selectedDrawing)
            this.addPointToSelected(this.selectedDrawing.x, this.selectedDrawing.y);
    }
}