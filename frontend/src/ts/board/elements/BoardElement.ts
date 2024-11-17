import BoardGraphics from "../BoardGraphics";
import BoardLayer from "../BoardLayer";
import { BoardGraphic } from "../BoardGraphic";

export default abstract class BoardElement {
    public layer: BoardLayer;
    public x: number;
    public y: number;
    public width: number;
    public height: number;
    constructor(layer: BoardLayer, x: number, y: number, width: number, height: number) {
        this.layer = layer;
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
    public get graphics(): ((graphics: BoardGraphics, caller?: BoardElement) => void)[] {
        return [this.render.bind(this), ...this.childGraphics.map(g => g.render)];
    }
}