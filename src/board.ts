interface Selectable {
    
}

class BoardElement {
    protected _layer!: BoardLayer;
    protected _x!: number;
    protected _y!: number;
    protected _imgSrc!: HTMLImageElement;
    protected _width!: number;
    protected _height!: number;
    public constructor(layer: BoardLayer, x: number, y: number, imgSrc: HTMLImageElement, width?: number, height?: number) {
        this.x = x;
        this.y = y;
        this.imgSrc = imgSrc;
        this.width = width ?? imgSrc.width;
        this.height = height ?? imgSrc.height;

        // Define this after everything else to avoid update events being sent.
        this._layer = layer;
    }
    private onUpdate() {
        if(this._layer != undefined)
            this._layer.onElementModified(this);
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
    public get imgSrc(): HTMLImageElement {
        return this._imgSrc;
    }
    public set imgSrc(imgSrc: HTMLImageElement) {
        this._imgSrc = imgSrc;
        this.onUpdate();
    }
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

class BoardLayer {
    public readonly board: Board;
    public readonly id: number;
    public elements: BoardElement[] = [];
    public constructor(board: Board, id: number) {
        if(id < 0)
            throw new Error("'id' must be greater than or equal to 0.");

        this.board = board;
        this.id = id;
    }
    public addElement(element: BoardElement) {
        this.elements.push(element);
        this.board.render();
    }
    public onElementModified(element: BoardElement) {
        this.board.onElementModified(this.id, element);
    }
}

class Board {
    private layers: BoardLayer[] = [];
    private readonly _canvas: HTMLCanvasElement;
    private readonly _graphics: BoardGraphicHelper;
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
        this._graphics = new BoardGraphicHelper(this, this._canvas.getContext("2d") as CanvasRenderingContext2D)
        this._graphics.clear();
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
        return this._graphics.isInImage(element, x, y);
    }
    public createLayer(id: number): BoardLayer {
        if(this.getLayer(id) != null)
            throw new Error("Cannot create a layer that already exists.");

        const layer = new BoardLayer(this, id);
        this.layers.push(layer);

        this.sortLayers();
        
        return layer;
    }
    public getLayer(id: number): BoardLayer|null {
        for (const layer of this.layers) {
            if(layer.id === id)
                return layer;
        }
        return null;
    }
    public sortLayers() {
        this.layers.sort((a, b) => {return a.id - b.id})
    }
    public createElement(layerId: number, x: number, y: number, imgSrc: HTMLImageElement, width?: number, height?: number): BoardElement {
        let layer: BoardLayer|null = this.getLayer(layerId);
        if(layer == null)
            layer = this.createLayer(layerId);

        const element: BoardElement = new BoardElement(layer, x, y, imgSrc, width, height);
        layer.addElement(element);

        return element;
    }
    public onElementModified(layerId: number, element: BoardElement) {
        this.render();
    }
    public render(): void {
        this._graphics.clear();

        this._graphics.drawGrid();

        for(const layer of this.layers) {
            for(const element of layer.elements) {
                this._graphics.drawImage(element);
            }
        }
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
        this.render();
    }
    public get yOffset(): number {
        return this._yOffset;
    }
    public set yOffset(yOffset:number) {
        this._yOffset = yOffset;
        this.render();
    }
    public get xyOffset(): [number, number] {
        return [this.xOffset, this.yOffset]
    }
    public set xyOffset(xyOffset: [number, number]) {
        this._xOffset = xyOffset[0];
        this._yOffset = xyOffset[1];
        this.render();
    }
    public get scale(): number {
        return this._scale;
    }
    public set scale(scale: number) {
        if(scale <= 0)
            throw new Error("'scale' must be greater than 0.");
        this._scale = scale;
        this.render();
    }
    public get cellSize(): number {
        return this._cellSize;
    }
    public set cellSize(cellSize: number) {
        if(cellSize < 0)
            cellSize = 0;
        this._cellSize = cellSize;
        this.render();
    }
}

class BoardGraphicHelper {
    private readonly _board: Board;
    private readonly _ctx: CanvasRenderingContext2D;
    public constructor(board: Board, ctx: CanvasRenderingContext2D) {
        this._board = board;
        this._ctx = ctx;
    }
    public clear() {
        this._ctx.clearRect(0, 0, this._board.width, this._board.height);
    }
    public drawGrid() {
        const { width, height, xOffset, yOffset, scale, cellSize } = this._board;

        this._ctx.beginPath();

        for(let x = (xOffset % cellSize) * scale; x <= width; x += cellSize * scale) {
            this._ctx.moveTo(x, 0);
            this._ctx.lineTo(x, height);
        }
    
        for(let y = (yOffset % cellSize) * scale; y <= height; y += cellSize * scale) {
            this._ctx.moveTo(0, y);
            this._ctx.lineTo(width, y);
        }
    
        this._ctx.stroke();
    }
    public getImagePath(image: BoardElement): Path2D {
        const { scale } = this._board;
        const { x, y, imgSrc, width, height } = image;
        const scaledWidth = width * scale;
        const scaledHeight = height * scale;

        // Create an offscreen canvas to capture the image.
        let offscreenCanvas = new OffscreenCanvas(scaledWidth, scaledHeight);
        let offscreenCanvasCtx = offscreenCanvas.getContext('2d');
        offscreenCanvasCtx?.drawImage(imgSrc, 0, 0, scaledWidth, scaledHeight);
        let imageData = offscreenCanvasCtx?.getImageData(0,0, scaledWidth, scaledHeight).data as Uint8ClampedArray;

        function isTransparent(x: number, y: number): boolean {
            // Check if the pixels are outside the image- if they are, considering them transparent.
            if(x < 0 || x >= scaledWidth|| y < 0 || y >= scaledHeight)
                return true;

            let colorIndex = (y * width + x) * 4;
            let alphaValue = imageData[colorIndex + 3];

            return alphaValue <= 0;
        }

        let points: [number, number][] = [];

        for(let x1 = 0; x1 < width; x1++) {
            for(let y1 = 0; y1 < height; y1++) {
                if(!isTransparent(x1, y1)) {
                    if((isTransparent(x1 + 1, y1) || isTransparent(x1 - 1, y1) || isTransparent(x1, y1 + 1) || isTransparent(x1, y1 - 1)))
                        points.push([x1, y1]);
                }
            }
        }

        // Researched some algorithms and it seems using the first half of a Graham Scan for a convex hull works best here.

        // Get Lowest Y and Leftmost
        let p0 = points.reduce((previous, current) => (current[1] < previous[1]) || (current[1] === previous[1] && current[0] < previous[0]) ? current : previous);

        function sqrDistance(p1: [number, number], p2: [number, number]): number {
            return (p2[0] - p1[0]) ** 2 + (p2[1] - p1[1]) ** 2;
        }

        points.sort((a, b) => {
            let diff = Math.atan2(a[1] - p0[1], a[0] - p0[0]) - Math.atan2(b[1] - p0[1], b[0] - p0[0]);
            if(diff == 0) {
                return sqrDistance(p0, a) - sqrDistance(p0, b);
            }
            return diff;
        });

        let uniquePoints: [number, number][] = [points[0]];
        
        // Encountered a common edgecase where values like [1, 24] and [24, 1] who share the same angle would cause errors. This solves this by removing the closest to p0 of those values.
        for(let i = 1; i < points.length; i++) {
            if(points[i - 1][0] != points[i][1] && points[i - 1][1] != points[i][0])
                uniquePoints.push(points[i - 1]);
        }


        let outlinePath = new Path2D();
        outlinePath.moveTo(this._board.toVirtualX(x + uniquePoints[0][0]), this._board.toVirtualY(y + uniquePoints[0][1]));
        for(let i = 1; i < uniquePoints.length; i++) {
            outlinePath.lineTo(this._board.toVirtualX(x + uniquePoints[i][0]), this._board.toVirtualY(y + uniquePoints[i][1]))
        }
        outlinePath.closePath();

        return outlinePath;
    }
    public drawImage(image: BoardElement) {
        const { scale } = this._board;
        const { x, y, imgSrc, width, height } = image;

        this._ctx.drawImage(imgSrc, this._board.toVirtualX(x), this._board.toVirtualY(y), width * scale, height * scale);
    }
    public isInImage(image: BoardElement, x: number, y: number): boolean {
        const path = this.getImagePath(image);
        this._ctx.stroke(path); // REMOVE
        return this._ctx.isPointInPath(path, x, y);
    }
}