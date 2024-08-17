import BoardElement from "./BoardElement";
import { BoardLayer, BoardGraphics } from "../";

export default class GraphicElement extends BoardElement {
    public tag: string;
    public parent: BoardElement|null = null;
    private _renderer: (graphics: BoardGraphics, caller?: BoardElement) => void;
    public static attachTo(parent: BoardElement, renderer: (graphics: BoardGraphics, caller?: BoardElement) => void, tag?: string): GraphicElement {
        const newGraphic = new GraphicElement(parent.layer, parent.x, parent.y, renderer, tag);
        newGraphic.parent = parent;
        parent.attachGraphic(newGraphic);
        return newGraphic;
    }
    constructor(layer: BoardLayer, x: number, y: number, renderer: (graphics: BoardGraphics, caller?: BoardElement) => void, tag?: string) {
        super(layer, x, y);
        this.tag = tag ? tag : "";
        this._renderer = renderer;
    }
    public override onUpdate(): void {
        if (this.parent) {
            this.parent.onUpdate();
        } else {
            this.layer.onElementModified(this);
        }
    }
    public override render(graphics: BoardGraphics): void {
        this._renderer(graphics, this.parent ? this.parent : undefined);
    }
    public destroy() {
        if(this.parent)
            this.parent.removeGraphic(this);
        else 
            this.layer.removeElement(this);
    }
}