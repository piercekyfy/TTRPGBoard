import Board from "./Board";
import { BoardElement, SelectableElement } from "./elements";

export default class BoardLayer {
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
    public get selectableElements(): SelectableElement[] {
        return this.elements.filter(e => e instanceof SelectableElement);
    }
}