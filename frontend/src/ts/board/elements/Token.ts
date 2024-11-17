import { BoardLayer, BoardGraphics } from "..";
import BoardElement from "./BoardElement";

export default class Token extends BoardElement {
    protected boundaryCache: [number, number][]|null = null;
    public imageSource: HTMLImageElement;
    public constructor(layer: BoardLayer, x: number, y: number, imgSource: HTMLImageElement, width?: number, height?: number) {
        super(layer, x, y, width ?? imgSource.width, height ?? imgSource.height)
        this.imageSource = imgSource;
    }
    protected override render(graphics: BoardGraphics): void {
        console.log(graphics);
        graphics.drawToken(this);
    }
    public getBoundaryPath(): [number, number][] { 
        const { x, y, width, height } = this;
        if(this.boundaryCache != null) {
            return this.boundaryCache.map(val => {return [val[0] + x, val[1] + y]});
        }

        const data = BoardGraphics.getImageData(width, height, this.imageSource);

        function isOpaque(x: number, y: number): boolean { 
            if (x < 0 || x >= width || y < 0 || y >= height)
                return false;

            return data[((y * (width) + x) * 4) + 3] > 20; 
        }

        this.boundaryCache = BoardGraphics.contour(isOpaque);
        return this.getBoundaryPath();
    }
    public override get selectable() { 
        return true;
    };
}