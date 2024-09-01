import SelectableElement from "./SelectableElement";
import { BoardLayer, BoardGraphics } from "..";

export default class DrawingElement extends SelectableElement {
    protected _boundaryCache: [number, number][]|null = null;
    private path: [number, number][] = [];
    public constructor(layer: BoardLayer, x: number, y: number) {
        super(layer, x, y, 1, 1);
    }
    public render(graphics: BoardGraphics): void {
        
        graphics.context.beginPath();
        graphics.context.moveTo(this.layer.board.toVirtualX(this.x), this.layer.board.toVirtualY(this.y));
        for(const point of this.path) {
            graphics.context.lineTo(this.layer.board.toVirtualX(this.x + point[0]), this.layer.board.toVirtualY(this.y + point[1]));
        }
        graphics.context.stroke();

        super.render(graphics);
    }
    public getBoundaryPath(): [number, number][] {
        const path: [number, number][] = this.path.map(point => [point[0] + this.x, point[1] + this.y]);
        path.unshift([this.x, this.y]);
        return path;
    }
    public addToPath(point: [number, number]) {
        this.path.push(point);
        const xs = this.path.map(point => point[0]);
        const ys = this.path.map(point => point[1]);
        this._width = Math.max(...xs) - Math.min(...xs);
        this._height = Math.max(...ys) - Math.min(...ys);
        this.onUpdate();
    }
    public onSelected(): boolean {
        this.layer.moveElementToTop(this);
        return true;
    }
    public onDeselected(): boolean {
        return true;
    }
    public onDrag(lastMousePos: [number, number], mousePos: [number, number]): void {
        this.x += (mousePos[0] - lastMousePos[0]) / this.layer.board.scale;
        this.y += (mousePos[1] - lastMousePos[1]) / this.layer.board.scale;
    }
}