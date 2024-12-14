import BoardGraphics from "../BoardGraphics";
import { BoardGraphic } from "../BoardGraphic";
import VirtualGrid from "../VirtualGrid";
import { XYGrid } from "..";

export default abstract class BoardElement {
    private _grid: VirtualGrid;
    private _x: number;
    private _y: number;
    private _width: number;
    private _height: number;
    private _title: string = "";
    constructor(grid: VirtualGrid, x: number, y: number, width: number, height: number) {
        this._grid = grid;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    protected childGraphics: BoardGraphic[] = [];
    protected abstract render(graphics: BoardGraphics): void;
    public attachGraphic(graphic: BoardGraphic) {
        this.childGraphics.push(graphic);
    }
    public removeGraphic(graphic: BoardGraphic) {
        this.childGraphics = this.childGraphics.filter(g => g != graphic);
    }
    public removeGraphicByTag(tag: string) {
        this.childGraphics = this.childGraphics.filter(g => g.tag != tag);
    }
    abstract getBoundaryPath(): [number, number][];
    public get selectable(): boolean {
        return false;
    }
    public onSelected() {
        if(!this.selectable)
            return;
    }
    public onDeselected() { 
        if(!this.selectable)
            return;
    }
    public onDrag(lastMousePos: [number, number], mousePos: [number, number]): void {
        if(!this.selectable)
            return;
        this.x += (mousePos[0] - lastMousePos[0]) / this.grid.scale;
        this.y += (mousePos[1] - lastMousePos[1]) / this.grid.scale;
    }
    public get grid(): XYGrid {
        return this._grid;
    }
    public get x(): number {
        return this._x;
    }
    public set x(x: number) {
        this._x = x;
    }
    public get y(): number {
        return this._y;
    }
    public set y(y: number) {
        this._y = y;
    }
    public get width(): number {
        return this._width;
    }
    public set width(width: number) {
        this._width = width;
    }
    public get height(): number {
        return this._height;
    }
    public set height(height: number) {
        this._height = height;
    }
    public get title(): string {
        return this._title;
    }
    public set title(title: string) {
        this._title = title;
    }
    public get graphics(): ((graphics: BoardGraphics, caller?: BoardElement) => void)[] {
        return [this.render.bind(this), ...this.childGraphics.map(g => g.render)];
    }
    public get virtualX(): number {
        return this.grid.toVirtualX(this.x);
    }
    public get virtualY(): number {
        return this.grid.toVirtualY(this.y);
    }
    public get virtualWidth(): number {
        return this.width * this.grid.scale;
    }
    public get virtualHeight(): number {
        return this.height * this.grid.scale;
    }
}