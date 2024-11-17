import { Game } from '..';
import { Board } from '../../board';
import { BoardElement } from '../../board/elements';

export default abstract class Tool {
    public abstract title: string;
    public abstract imageURL: string;
    protected _game: Game;

    public constructor(game: Game) {
        this._game = game;
    }
    public onKeyUp(e: KeyboardEvent): void {};
    public onMouseDown(e: MouseEvent, on: BoardElement|null): void {};
    public onMouseMove(e: MouseEvent, lastMousePos: [number, number]): void {};
    public onMouseUp(e: MouseEvent, on: BoardElement|null): void {};
    public onWheel(e: WheelEvent): void {};
    protected get selection(): BoardElement[] {
        return this._game.selection;
    }
    protected get selected(): boolean {
        return this._game.selected;
    }
    protected get board(): Board {
        return this._game.board;
    }
}