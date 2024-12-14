export default interface VirtualGrid {
    get xOffset(): number;
    get yOffset(): number;
    get width(): number;
    get height(): number;
    get scale(): number;
    get cellSize(): number;
    toVirtualX(x: number): number;
    toVirtualY(y: number): number;
    toRealX(x: number): number;
    toRealY(y: number): number;
}