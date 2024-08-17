import SelectableElement from "./SelectableElement";
import { BoardLayer, BoardGraphics } from "../";

export default class Token extends SelectableElement {
    protected _boundaryCache: [number, number][]|null = null;
    private _imgSrc!: HTMLImageElement;
    public constructor(layer: BoardLayer, x: number, y: number, imgSrc: HTMLImageElement, width?: number, height?: number) {
        super(layer, x, y, width ?? imgSrc.width, height ?? imgSrc.height);
        this._imgSrc = imgSrc;
    }
    public render(graphics: BoardGraphics): void {
        graphics.drawToken(this);
        super.render(graphics);
    }
    public getBoundaryPath(): [number, number][] {
        const { layer: _layer, x, y, width, height } = this;
        if(this._boundaryCache != null) {
            return this._boundaryCache.map(val => {return [val[0] + x, val[1] + y]});
        }

        let offscreenCanvas = new OffscreenCanvas(width, height);
        let offscreenCanvasCtx = offscreenCanvas.getContext('2d');
        offscreenCanvasCtx?.drawImage(this.imgSrc, 0, 0, width, height);
        let data = offscreenCanvasCtx?.getImageData(0,0, width, height).data as Uint8ClampedArray;

        function isOpaque(x: number, y: number): boolean { 
            if (x < 0 || x >= width || y < 0 || y >= height)
                return false;

            return data[((y * (width) + x) * 4) + 3] > 20; 
        }

        this._boundaryCache = BoardGraphics.contour(isOpaque);
        return this.getBoundaryPath();
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
    public get imgSrc(): HTMLImageElement {
        return this._imgSrc;
    }
    public set imgSrc(imgSrc: HTMLImageElement) {
        this._imgSrc = imgSrc;
        this.onUpdate();
    }
}