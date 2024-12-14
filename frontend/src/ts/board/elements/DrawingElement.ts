import { BoardLayer, BoardGraphics } from "..";
import VirtualGrid from "../VirtualGrid";
import BoardElement from "./BoardElement";

export default class DrawingElement extends BoardElement {
    protected _boundaryCache: [number, number][]|null = null;
    private path: [number, number][] = [];
    public constructor(grid: VirtualGrid, firstPoint: [number, number]) {
        super(grid, firstPoint[0], firstPoint[1], 1, 1);
        this.addToPath(firstPoint);
    }
    public override render(graphics: BoardGraphics): void {
        if(this.path.length == 0)
            return;

        graphics.context.beginPath();
        let point = this.path[0];
        graphics.context.moveTo(this.grid.toVirtualX(point[0]), this.grid.toVirtualY(point[1]));
        for(let i = 1; i < this.path.length; i++) {
            point = this.path[i];
            graphics.context.lineTo(this.grid.toVirtualX(point[0]), this.grid.toVirtualY(point[1]));
        }

        graphics.context.stroke();
    }
    public override getBoundaryPath(): [number, number][] {
        const path: [number, number][] = this.path.map(point => [point[0], point[1]]);
        return path;
    }
    public addToPath(point: [number, number]) {
        this.path.push([this.grid.toRealX(point[0]), this.grid.toRealY(point[1])]);
        const xs = this.path.map(point => point[0]);
        const ys = this.path.map(point => point[1]);

        const maxX = Math.max(...xs);
        const minX = Math.min(...xs);
        const maxY = Math.max(...ys);
        const minY = Math.min(...ys);
        this.x = minX;
        this.y = minY;
        this.width = maxX - minX;
        this.height = maxY - minY;
    }
    public override get selectable(): boolean {
        return true;
    }
}