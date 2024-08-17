// Something that visibly exists on a layer of the board.
abstract class BoardElement {
    public layer!: BoardLayer;
    protected _childGraphics: BoardGraphic[] = [];
    private _x!: number;
    private _y!: number;
    public constructor(layer: BoardLayer, x: number, y: number) {
        this.layer = layer;
        this._x = x;
        this._y = y;
    }
    public render(graphics: BoardGraphicHelper): void
    {
        for(const graphic of this._childGraphics) {
            graphic.render(graphics);
        }
    }; 
    public onUpdate() {
        if(this.layer)
            this.layer.onElementModified(this);
    }
    public attachGraphic(graphic: BoardGraphic) {
        if(this._childGraphics.includes(graphic))
            throw new Error("Graphic already exists on element.");
        this._childGraphics.push(graphic);
    }
    public removeGraphic(graphic: BoardGraphic) {
        for(let i = 0; i < this._childGraphics.length; i++) {
            if(this._childGraphics[i] === graphic) {
                this._childGraphics.splice(i, 1);
                return;
            }
        }
        throw new Error("Graphic does not exist on element");
    }
    public removeGraphicByTag(tag: string) {
        const remove: BoardGraphic[] = [];
        for(let i = 0; i < this._childGraphics.length; i++) {
            if(this._childGraphics[i].tag == tag) {
                remove.push(this._childGraphics[i]);
                return;
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

// A board element which can be selected and interacted with by the user.
abstract class SelectableBoardElement extends BoardElement {
    private _width!: number;
    private _height!: number;
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

class BoardGraphic extends BoardElement {
    public tag: string;
    private parent: BoardElement|null = null;
    private _renderer: (graphics: BoardGraphicHelper, caller?: BoardElement) => void;
    public static attachTo(parent: BoardElement, renderer: (graphics: BoardGraphicHelper, caller?: BoardElement) => void, tag?: string): BoardGraphic {
        const newGraphic = new BoardGraphic(parent.layer, parent.x, parent.y, renderer, tag);
        parent.attachGraphic(newGraphic);
        return newGraphic;
    }
    constructor(layer: BoardLayer, x: number, y: number, renderer: (graphics: BoardGraphicHelper, caller?: BoardElement) => void, tag?: string) {
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
    public override render(graphics: BoardGraphicHelper): void {
        this._renderer(graphics, this.parent ? this.parent : undefined);
    }
    public destroy() {
        if(this.parent)
            this.parent.removeGraphic(this);
        else 
            this.layer.removeElement(this);
    }
}

class Token extends SelectableBoardElement {
    protected _boundaryCache: [number, number][]|null = null;
    private _imgSrc!: HTMLImageElement;
    public constructor(layer: BoardLayer, x: number, y: number, imgSrc: HTMLImageElement, width?: number, height?: number) {
        super(layer, x, y, width ?? imgSrc.width, height ?? imgSrc.height);
        this._imgSrc = imgSrc;
    }
    public render(graphics: BoardGraphicHelper): void {
        graphics.drawToken(this);
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

        this._boundaryCache = BoardGraphicHelper.contour(isOpaque);
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
    public moveElementToTop(element: BoardElement) {

        for(let i = 0; i < this.elements.length; i++) {
            if(this.elements[i] === element) {
                this.elements[i] = this.elements[this.elements.length - 1];
                this.elements[this.elements.length - 1] = element;
                this.board.render();
                return;
            }
        }

        throw new Error("Element does not exist in layer.");
    }
    public addElement(element: BoardElement) {
        this.elements.push(element);
        this.board.render();
    }
    public removeElement(element: BoardElement) {
        for(let i = 0; i < this.elements.length; i++) {
            if(this.elements[i] === element) {
                this.elements.splice(i, 1);
                this.board.render();
                return;
            }
        }
    }
    public onElementModified(element: BoardElement) {
        this.board.onElementModified(this.id, element);
    }
    public get selectableElements(): SelectableBoardElement[] {
        return this.elements.filter(e => e instanceof SelectableBoardElement);
    }
}

class Board {
    // _layers is **always** sorted.
    private _layers: BoardLayer[] = [new BoardLayer(this, 99)];
    private _graphicsLayer: BoardGraphic[] = [];
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
    public render(): void {
        this._graphics.clear();

        this._graphics.drawGrid();

        for(const layer of this._layers) {
            for(const element of layer.elements) {
                this._graphics.renderElement(element);
            }
        }
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
    public isInElement(element: SelectableBoardElement, x: number, y: number): boolean {
        return this._graphics.isPointInElement(element, x, y);
    }
    public elementsInRect(x: number, y: number, width: number, height: number): SelectableBoardElement[] {
        const elements: SelectableBoardElement[] = [];
        for(const element of this.selectableElements) {
            if(this.toVirtualX(element.x) + (element.width * this.scale) > x && this.toVirtualX(element.x) < x + width && (this.toVirtualY(element.y) + (element.height * this.scale) > y && this.toVirtualY(element.y) < y + height)) {
                elements.push(element);
            }
        }
        return elements;
    }
    public getElementsAt(x: number, y: number, layer?: number): SelectableBoardElement[] {
        const elements: SelectableBoardElement[] = [];
        if(layer){
            const l = this.getLayer(layer);
            if(l == null)
                throw new Error("Specified layer does not exist.");
            for(const element of l.selectableElements) {
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
    public getTopElementAt(x: number, y: number, layer?: number) : SelectableBoardElement|null {
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
    }
    public getLayer(id: number): BoardLayer|null {
        for (const layer of this._layers) {
            if(layer.id === id)
                return layer;
        }
        return null;
    }
    public sortLayers() {
        this._layers.sort((a, b) => {return a.id - b.id})
    }
    public createToken(layerId: number, x: number, y: number, imgSrc: HTMLImageElement, width?: number, height?: number): BoardElement {
        let layer: BoardLayer|null = this.getLayer(layerId);
        if(layer == null)
            layer = this.createLayer(layerId);

        const element: BoardElement = new Token(layer, x, y, imgSrc, width, height);
        layer.addElement(element);

        return element;
    }
    public onElementModified(layerId: number, element: BoardElement) {
        this.render();
    }
    private get elements(): BoardElement[] {
        const elements: BoardElement[] = [];
        for(const layer of this._layers) {
            for(const element of layer.elements) {
                elements.push(element);
            }
        }
        return elements;
    }
    private get selectableElements(): SelectableBoardElement[] {
        const elements: SelectableBoardElement[] = [];
        for(const layer of this._layers) {
            for(const element of layer.elements) {
                if(element instanceof SelectableBoardElement)
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
    public get graphicLayer(): BoardLayer {
        return this.getLayer(99) as BoardLayer;
    }
}

class BoardGraphicHelper {
    public readonly board: Board;
    public readonly context: CanvasRenderingContext2D;
    public constructor(board: Board, ctx: CanvasRenderingContext2D) {
        this.board = board;
        this.context = ctx;
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
        const { x, y, imgSrc, width, height } = token;

        this.context.drawImage(imgSrc, this.board.toVirtualX(x), this.board.toVirtualY(y), width * scale, height * scale);
    }
    public renderElement(element: BoardElement) {
        element.render(this);
    }
    public getPath(points: [number, number][]): Path2D {
        let path = new Path2D();
        path.moveTo(this.board.toVirtualX(points[0][0]), this.board.toVirtualY(points[0][1]));
        for(let i = 1; i < points.length; i++) {
            path.lineTo(this.board.toVirtualX(points[i][0]), this.board.toVirtualY(points[i][1]));
        }
        return path;
    }
    public isPointInElement(element: SelectableBoardElement, x: number, y: number): boolean {
        return this.context.isPointInPath(this.getPath(element.getBoundaryPath()), x, y);
    }
    public drawDebugBorderOn(element: SelectableBoardElement) {
        this.context.stroke(this.getPath(element.getBoundaryPath()));
    }
}