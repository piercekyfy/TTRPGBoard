import Board from './Board';
import { BoardGraphic } from './BoardGraphic';
import { BoardElement, Token } from './elements';

export default class BoardGraphics {
    public readonly board: Board;
    public readonly context: CanvasRenderingContext2D;
    public constructor(board: Board, ctx: CanvasRenderingContext2D) {
        this.board = board;
        this.context = ctx;
    }
    public static getImageData(width: number, height: number, imageSource: HTMLImageElement): Uint8ClampedArray  {
        let offscreenCanvas = new OffscreenCanvas(width, height);
        let offscreenCanvasCtx = offscreenCanvas.getContext('2d');
        offscreenCanvasCtx?.drawImage(imageSource, 0, 0, width, height);
        return offscreenCanvasCtx?.getImageData(0,0, width, height).data as Uint8ClampedArray;
    }
    public static contourDirLookup: [number,number][] = [[1, 0], [0, -1], [1, 0], [1, 0], [-1, 0], [0, -1], [NaN, NaN], [1, 0], [0, 1], [NaN, NaN], [0, 1], [0, 1], [-1, 0], [0, -1], [-1, 0], [NaN, NaN]];
    // Generates an outline path using the supplied Isovalue Threshold callback with a marching squares algorithm.
    public static contour(threshold: (x: number, y: number) => boolean): [number, number][] {
        
        // Find the starting point by moving diagonally from the corner of the image.
        let startX = 0;
        let startY = 0;
        while(true) {
            if(threshold(startX, startY))
                break;
            if (startX === 0) {
                startX = startY + 1;
                startY = 0;
            } else {
                startX = startX - 1;
                startY = startY + 1;
            }
        }

        let x = startX;
        let y = startY;
        let dir: [number, number] = [0,0];
        let prevDir: [number, number] = [NaN, NaN];
        const path: [number, number][] = [];
        
        let i = 0;
        do {
            // Calculate 4-bit index based on which corners meet the threshold.
            let cellValue = 0;
            if (threshold(x,y)) cellValue += 8;
            if (threshold(x - 1, y)) cellValue += 4;
            if (threshold(x, y - 1)) cellValue += 2;
            if (threshold(x - 1, y - 1)) cellValue += 1;

            // Get the direction we should move based on this index.
            switch(cellValue) {
                case 9:
                    dir = [prevDir[1] === -1 ? -1 : 1, 0];
                    break;
                case 6:
                    dir = [0, prevDir[0] === 1 ? -1 : 1];
                    break;
                default:
                    dir = this.contourDirLookup[cellValue];
                    if(Number.isNaN(dir[0]))
                        console.error("wrong");
                    break;
            }

            if(dir != prevDir) {
                path.push([x,y]);
                prevDir = dir;
            }

            x += dir[0];
            y += dir[1];
            i++;
        } while (!(x == startX && y == startY));

        // TODO: Do optional Linear Interpolation here.

        return path;
    }
    public clear() {
        this.context.clearRect(0, 0, this.board.width, this.board.height);
    }
    public drawGrid() {
        const { width, height, xOffset, yOffset, scale, cellSize } = this.board;

        this.context.beginPath();

        for(let x = (xOffset % cellSize) * scale; x <= width; x += cellSize * scale) {
            this.context.moveTo(x, 0);
            this.context.lineTo(x, height);
        }
    
        for(let y = (yOffset % cellSize) * scale; y <= height; y += cellSize * scale) {
            this.context.moveTo(0, y);
            this.context.lineTo(width, y);
        }
    
        this.context.stroke();
    }
    public drawToken(token: Token) {
        const { scale } = this.board;
        const { x, y, imageSource, width, height } = token;

        this.context.drawImage(imageSource, this.board.toVirtualX(x), this.board.toVirtualY(y), width * scale, height * scale);
    }
    public renderGraphic(graphic: BoardGraphic) {
        graphic.render(this);
    }
    public renderElement(element: BoardElement) {
        element.graphics.forEach(g => g(this, element));
    }
    public getPath(points: [number, number][]): Path2D {
        if(points.length == 0)
            return new Path2D();

        let path = new Path2D();
        path.moveTo(this.board.toVirtualX(points[0][0]), this.board.toVirtualY(points[0][1]));
        for(let i = 1; i < points.length; i++) {
            path.lineTo(this.board.toVirtualX(points[i][0]), this.board.toVirtualY(points[i][1]));
        }
        return path;
    }
    public isPointInElement(element: BoardElement, x: number, y: number): boolean {
        return this.context.isPointInPath(this.getPath(element.getBoundaryPath()), x, y);
    }
    public drawDebugBorderOn(element: BoardElement) {
        this.context.stroke(this.getPath(element.getBoundaryPath()));
    }
}