import GraphicElement from "./GraphicElement";
import { BoardLayer, BoardGraphics } from "..";

export default abstract class BoardElement {
    public layer!: BoardLayer;
    protected _childGraphics: GraphicElement[] = [];
    private _x!: number;
    private _y!: number;
    public constructor(layer: BoardLayer, x: number, y: number) {
        this.layer = layer;
        this._x = x;
        this._y = y;
    }
    public render(graphics: BoardGraphics): void
    {
        for(const graphic of this._childGraphics) {
            graphic.render(graphics);
        }
    }; 
    public onUpdate() {
        if(this.layer)
            this.layer.onElementModified(this);
    }
    public attachGraphic(graphic: GraphicElement) {
        if(this._childGraphics.includes(graphic))
            throw new Error("Graphic already exists on element.");
        this._childGraphics.push(graphic);
    }
    public removeGraphic(graphic: GraphicElement) {
        for(let i = 0; i < this._childGraphics.length; i++) {
            if(this._childGraphics[i] === graphic) {
                this._childGraphics.splice(i, 1);
                return;
            }
        }
        throw new Error("Graphic does not exist on element");
    }
    public removeGraphicByTag(tag: string) {
        const remove: GraphicElement[] = [];
        for(let i = 0; i < this._childGraphics.length; i++) {
            if(this._childGraphics[i].tag == tag) {
                remove.push(this._childGraphics[i]);
            }
        }
        for(const graphic of remove) {
            this.removeGraphic(graphic);
        }
    }
    public get layerId(): number {
        return this.layer ? this.layer.id : -1;
    }
    public get x(): number {
        return this._x;
    }
    public set x(x: number) {
        this._x = x;
        this.onUpdate();
    }
    public get y(): number {
        return this._y;
    }
    public set y(y: number) {
        this._y = y;
        this.onUpdate();
    }
}