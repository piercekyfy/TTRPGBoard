import BoardGraphics from "../BoardGraphics";
import BoardLayer from "../BoardLayer";
import { BoardGraphic } from "../BoardGraphic";

export default abstract class BoardElement {
    private _layer: BoardLayer;
    private _x: number;
    private _y: number;
    private _width: number;
    private _height: number;
    constructor(layer: BoardLayer, x: number, y: number, width: number, height: number) {
        this._layer = layer;
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
        this.layer.moveElementToTop(this);
    }
    public onDeselected() { 
        if(!this.selectable)
            return;
    }
    public onDrag(lastMousePos: [number, number], mousePos: [number, number]): void {
        if(!this.selectable)
            return;
        this.x += (mousePos[0] - lastMousePos[0]) / this.layer.board.scale;
        this.y += (mousePos[1] - lastMousePos[1]) / this.layer.board.scale;
    }
    public get layer(): BoardLayer {
        return this._layer;
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
    public get graphics(): ((graphics: BoardGraphics, caller?: BoardElement) => void)[] {
        return [this.render.bind(this), ...this.childGraphics.map(g => g.render)];
    }
    public get virtualX(): number {
        return this.layer.board.toVirtualX(this.x);
    }
    public get virtualY(): number {
        return this.layer.board.toVirtualY(this.y);
    }
    public get virtualWidth(): number {
        return this.width * this.layer.board.scale;
    }
    public get virtualHeight(): number {
        return this.height * this.layer.board.scale;
    }
}