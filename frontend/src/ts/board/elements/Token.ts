import { BoardLayer, BoardGraphics } from "..";
import VirtualGrid from "../VirtualGrid";
import BoardElement from "./BoardElement";

export default class Token extends BoardElement {
    protected boundaryCache: [number, number][]|null = null;
    public imageSource: HTMLImageElement;
    private _scale: number;
    public constructor(grid: VirtualGrid, x: number, y: number, imgSource: HTMLImageElement, width?: number, height?: number) {
        super(grid, x, y, width ?? imgSource.width, height ?? imgSource.height);
        this.imageSource = imgSource;
    }
    protected override render(graphics: BoardGraphics): void {
        graphics.drawToken(this);
    }
    public getBoundaryPath(): [number, number][] { 
        const { x, y, _scale: scale} = this;
        if(this.boundaryCache != null) {
            return this.boundaryCache.map(val => {return [val[0] + x, val[1] + y]});
        }

        const data = BoardGraphics.getImageData(scale, scale, this.imageSource);

        function isOpaque(x: number, y: number): boolean { 
            if (x < 0 || x >= scale || y < 0 || y >= scale)
                return false;

            return data[((y * (scale) + x) * 4) + 3] > 20; 
        }

        this.boundaryCache = BoardGraphics.contour(isOpaque);
        return this.getBoundaryPath();
    }
    public override get selectable() { 
        return true;
    };
    public override get width(): number {
        return this._scale;
    }
    public override set width(width: number) {
        this.boundaryCache = null;
        if(width < this.grid.cellSize)
            this._scale = this.grid.cellSize;
        else 
            this._scale = width;
        
    }
    public override get height(): number {
        return this._scale;
    }
    public override set height(height: number) {
        this.boundaryCache = null;
        if(height < this.grid.cellSize)
            this._scale = this.grid.cellSize;
        else 
            this._scale = height;
    }
}