import { BoardLayer, BoardGraphics } from "..";
import BoardElement from "./BoardElement";

export default class DrawingElement extends BoardElement {
    protected _boundaryCache: [number, number][]|null = null;
    private path: [number, number][] = [];
    public constructor(layer: BoardLayer, x: number, y: number) {
        super(layer, x, y, 1, 1);
    }
    public override render(graphics: BoardGraphics): void {
        graphics.context.beginPath();
        graphics.context.moveTo(this.layer.board.toVirtualX(this.x), this.layer.board.toVirtualY(this.y));
        for(const point of this.path) {
            graphics.context.lineTo(this.layer.board.toVirtualX(this.x + point[0]), this.layer.board.toVirtualY(this.y + point[1]));
        }
        graphics.context.stroke();
    }
    public override getBoundaryPath(): [number, number][] {
        const path: [number, number][] = this.path.map(point => [point[0] + this.x, point[1] + this.y]);
        path.unshift([this.x, this.y]);
        return path;
    }
    public addToPath(point: [number, number]) {
        this.path.push(point);
        const xs = this.path.map(point => point[0]);
        const ys = this.path.map(point => point[1]);
        this.width = Math.max(...xs) - Math.min(...xs);
        this.height = Math.max(...ys) - Math.min(...ys);
    }
    public override get selectable(): boolean {
        return true;
    }
}