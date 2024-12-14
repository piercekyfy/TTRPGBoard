import { BoardElement, DrawingElement, Token } from "./elements";
import BoardLayer from "./BoardLayer";
import BoardGraphics from "./BoardGraphics";
import { BoardGraphic } from "./BoardGraphic";
import VirtualGrid from "./VirtualGrid";

export default class Board implements VirtualGrid {
    // _layers is **always** sorted.
    private _layers: BoardLayer[] = [new BoardLayer(this, 99)];
    private readonly _canvas: HTMLCanvasElement;
    private readonly _graphics: BoardGraphics;
    private graphicFrame: BoardGraphic[] = [];
    private _xOffset: number = 0;
    private _yOffset: number = 0;
    private _scale: number = 1;
    private _cellSize: number = 64;
    public constructor(canvas: HTMLCanvasElement, width: number, height: number) {
        this._canvas = canvas;
        
        // Configure Canvas
        this._canvas.width = width;
        this._canvas.height = height;

        // Initialize GraphicsHelper
        this._graphics = new BoardGraphics(this, this._canvas.getContext("2d") as CanvasRenderingContext2D)
        this._graphics.clear();
    }
    public render(): void {
        this._graphics.clear();

        this._graphics.drawGrid();

        for(const graphic of this.graphicFrame) {
            this._graphics.renderGraphic(graphic);
        }

        for(const layer of this._layers) {
            for(const element of layer.elements()) {
                this._graphics.renderElement(element);
            }
        }
    }
    public addGraphic(graphic: BoardGraphic) { // TODO: Give each layer a 'GraphicFrame' and allow this to be filtered by layer
        this.graphicFrame.push(graphic);
    }
    public removeGraphic(graphic: BoardGraphic) {
        this.graphicFrame = this.graphicFrame.filter(g => {g != graphic;});
    }
    public toVirtualX(x: number): number {
        return (x + this.xOffset) * this._scale;
    }
    public toVirtualY(y: number): number {
        return (y + this.yOffset) * this._scale;
    }
    public toRealX(x: number): number {
        return (x / this._scale) - this.xOffset;
    }
    public toRealY(y: number): number {
        return (y / this._scale) - this.yOffset;
    }
    public isInVirtualRect(x: number, y: number, virtualX: number, virtualY: number, width: number, height: number): boolean {
        return ((x >= virtualX && x <= virtualX + width) && (y >= virtualY && y <= virtualY + height));
    }
    public isInElement(element: BoardElement, x: number, y: number): boolean {
        return this._graphics.isPointInElement(element, x, y);
    }
    public elementsInRect(x: number, y: number, width: number, height: number): BoardElement[] {
        const elements: BoardElement[] = [];
        for(const element of this.selectableElements) {
            if(this.toVirtualX(element.x) + (element.width * this.scale) > x && this.toVirtualX(element.x) < x + width && (this.toVirtualY(element.y) + (element.height * this.scale) > y && this.toVirtualY(element.y) < y + height)) {
                elements.push(element);
            }
        }
        return elements;
    }
    public getElementsAt(x: number, y: number, layer?: number): BoardElement[] {
        const elements: BoardElement[] = [];
        if(layer){
            const l = this.getLayer(layer);
            if(l == null)
                throw new Error("Specified layer does not exist.");
            for(const element of l.selectableElements()) {
                if(this.isInElement(element, x, y))
                    elements.push(element);
            }
        } else {
            for(const element of this.selectableElements) {
                if(this.isInElement(element, x, y))
                    elements.push(element);
            }
        }

        return elements;
    } 
    public getLayerOf(element: BoardElement): BoardLayer|null { // TODO: This is horribly inefficient. Look into a better way to do this.
        for(let layer of this._layers) {
            if(layer.contains(element))
                return layer;
        }
        return null;
    }
    public getTopElementAt(x: number, y: number, layer?: number) : BoardElement|null {
        const result = this.getElementsAt(x, y, layer);
        return result.length == 0 ? null : result[result.length - 1];
    }
    public createLayer(id: number): BoardLayer {
        if(this.getLayer(id) != null)
            throw new Error("Cannot create a layer that already exists.");

        const layer = new BoardLayer(this, id);
        this._layers.push(layer);

        this.sortLayers();
        
        return layer;
    } // TODO: Realize that 'z' doesn't imply it must be unique. Allow multiple Layers on a Z or figure out something else.
    public getLayer(z: number): BoardLayer|null {
        for (const layer of this._layers) {
            if(layer.z === z)
                return layer;
        }
        return null;
    }
    public sortLayers() {
        this._layers.sort((a, b) => {return a.z - b.z})
    }
    public createToken(layerId: number, x: number, y: number, imgSrc: HTMLImageElement, width?: number, height?: number): Token {
        let layer: BoardLayer|null = this.getLayer(layerId);
        if(layer == null)
            layer = this.createLayer(layerId);

        const element: Token = new Token(this, x, y, imgSrc, width, height);
        layer.add(element);

        return element;
    }
    public createDrawing(layerId: number, firstPoint: [number, number]): DrawingElement {
        let layer: BoardLayer|null = this.getLayer(layerId);
        if(layer == null)
            layer = this.createLayer(layerId); //TODO: Duplicate code, findOrCreate() needed

        const element: DrawingElement = new DrawingElement(this, firstPoint);
        layer.add(element);

        return element;
    }
    private get elements(): BoardElement[] {
        const elements: BoardElement[] = [];
        for(const layer of this._layers) {
            for(const element of layer.elements()) {
                elements.push(element);
            }
        }
        return elements;
    }
    private get selectableElements(): BoardElement[] {
        const elements: BoardElement[] = [];
        for(const layer of this._layers) {
            for(const element of layer.selectableElements()) {
                elements.push(element);
            }
        }
        return elements;
    }
    public get width(): number {
        return this._canvas.clientWidth;
    }
    public get height(): number {
        return this._canvas.clientHeight;
    }
    public get xOffset(): number {
        return this._xOffset;
    }
    public set xOffset(xOffset: number) {
        this._xOffset = xOffset;
    }
    public get yOffset(): number {
        return this._yOffset;
    }
    public set yOffset(yOffset:number) {
        this._yOffset = yOffset;
    }
    public get xyOffset(): [number, number] {
        return [this.xOffset, this.yOffset]
    }
    public set xyOffset(xyOffset: [number, number]) {
        this._xOffset = xyOffset[0];
        this._yOffset = xyOffset[1];
    }
    public get scale(): number {
        return this._scale;
    }
    public set scale(scale: number) {
        if(scale <= 0)
            throw new Error("'scale' must be greater than 0.");
        this._scale = scale;
    }
    public get cellSize(): number {
        return this._cellSize;
    }
    public set cellSize(cellSize: number) {
        if(cellSize < 0)
            cellSize = 0;
        this._cellSize = cellSize;
    }
    public get graphicLayer(): BoardLayer {
        return this.getLayer(99) as BoardLayer;
    }
}

