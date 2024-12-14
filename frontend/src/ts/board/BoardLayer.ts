import Board from "./Board";
import { BoardElement } from "./elements";

class LayerNode {
    public constructor(public value: BoardElement, public next: LayerNode|null = null, public prev: LayerNode|null = null) {
        if(this.next && this.next.prev == null) {
            this.next.prev = this;
        }
    }
}

/// Functionally a linked list which contains BoardElements in the order they are rendered.
export default class BoardLayer {
    private head: LayerNode|null;
    private tail: LayerNode|null;
    private _size: number = 0;

    public constructor(readonly board: Board, readonly z: number) {}

    public add(element: BoardElement) {
        if(this.head) {
            this.head = new LayerNode(element, this.head);
        } else {
            this.head = new LayerNode(element);
            this.tail = this.head;
        }
        this._size++;
    }
    public remove(element: BoardElement) {
        let node: LayerNode|null = this.head;
        while(node != null) {
            if(node.value === element) {
                if(node.prev == null) {
                    this.head = node.next;
                    this.tail = this.head;
                }
                else {
                    if(node.next == null)
                        this.tail = node.prev;
                    node.prev.next = node.next;
                    
                }

                this._size--;
                return;
            }

            node = node.next;
        }
        throw new Error("BoardElement does not exist in layer.");
    }
    public contains(element: BoardElement): boolean {
        let node: LayerNode|null = this.head;
        while(node != null) {
            if(node.value === element)
                return true;

            node = node.next;
        }
        return false;
    }
    public toTop(element: BoardElement) {
        if(this.size <= 1)
            return;

        let node: LayerNode|null = this.head;
        while(node != null) {
            if(node.value == element) {
                if(node == this.tail)
                    return;
                
                const tail = (this.tail as LayerNode);
                
                if(node == this.head) {
                    this.head = node.next;
                    if(this.head) {
                        this.head.prev = null;
                    }
                } else {
                    if(node.prev != null)
                        node.prev.next = node.next;
                    if(node.next != null)
                        node.next.prev = node.prev;
                }

                node.next = null;
                node.prev = this.tail;
                if(this.tail != null)
                    this.tail.next = node;
                this.tail = node;

                return;
            }
            node = node.next;
        }
        throw new Error("BoardElement does not exist in layer.");
    }
    
    public *elements() {
        let node: LayerNode|null = this.head;
        while (node != null) {
            yield node.value;
            node = node.next;
        }
    }
    public *selectableElements() {
        let node: LayerNode|null = this.head;
        while (node != null) {
            if(node.value.selectable)
                yield node.value;
            node = node.next;
        }
    }
    public get size() {
        return this._size;
    }
}