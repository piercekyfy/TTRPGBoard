import BoardElement from "./BoardElement";
import { BoardLayer } from "../";

export default abstract class SelectableElement extends BoardElement {
    protected _width!: number;
    protected _height!: number;
    public constructor(layer: BoardLayer, x: number, y: number, width: number, height: number) {
        super(layer, x, y);
        this._width = width;
        this._height = height;
    }
    public abstract getBoundaryPath(): [number, number][];
    public abstract onSelected(): boolean;
    public abstract onDeselected(): boolean;
    public abstract onDrag(lastMousePos: [number, number], mousePos: [number, number]): void;
    public get width(): number {
        return this._width;
    }
    public set width(width: number) {
        this._width = width;
        this.onUpdate();
    }
    public get height(): number {
        return this._height;
    }
    public set height(height: number) {
        this._height = height;
        this.onUpdate();
    }
}