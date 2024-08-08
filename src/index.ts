const imgEdwin: HTMLImageElement = document.getElementById('img-edwin') as HTMLImageElement;
const canvas: HTMLCanvasElement = document.getElementById('game') as HTMLCanvasElement;

const board: Board = new Board(canvas, document.documentElement.clientWidth, document.documentElement.clientHeight);

board.render();

let token = board.createElement(1, 64,64, imgEdwin, 64, 64);
let token2 = board.createElement(2, 128,64, imgEdwin, 64, 64);

document.addEventListener("mousedown", (e: MouseEvent) => {
    //token.x += 100;
    //token2.y += 5;
})

document.addEventListener("dragstart", (e: DragEvent) => {
    console.log("drag start");
})

document.addEventListener("mousemove", (e: MouseEvent) => {
    console.log(board.isInElement(token, e.clientX, e.clientY));
})