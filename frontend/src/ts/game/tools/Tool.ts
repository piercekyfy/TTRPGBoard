import { Game } from '..';
import { Board } from '../../board';
import { SelectableElement } from '../../board/elements';

export default abstract class Tool {
    public abstract title: string;
    protected _game: Game;

    public constructor(game: Game) {
        this._game = game;
    }
    public onKeyUp(e: KeyboardEvent): void {};
    public onMouseDown(e: MouseEvent, on: SelectableElement|null): void {};
    public onMouseMove(e: MouseEvent, lastMousePos: [number, number]): void {};
    public onMouseUp(e: MouseEvent, on: SelectableElement|null): void {};
    public onWheel(e: WheelEvent): void {};
    protected get selection(): SelectableElement[] {
        return this._game.selection;
    }
    protected get selected(): boolean {
        return this._game.selected;
    }
    protected get board(): Board {
        return this._game.board;
    }
}