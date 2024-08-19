import {Board} from './board';
import {Game} from './game';

const imgEdwin: HTMLImageElement = document.getElementById('img-edwin') as HTMLImageElement;
const canvas: HTMLCanvasElement = document.getElementById('game') as HTMLCanvasElement;

const board: Board = new Board(canvas, document.documentElement.clientWidth, document.documentElement.clientHeight);

let token = board.createToken(1, 64,64, imgEdwin, 64, 64);
let token2 = board.createToken(2, 128,64, imgEdwin, 128, 128);
let token3 = board.createToken(1, 32,64, imgEdwin, 64, 64);

const game = new Game(board);

function animFrame() {
    game.onAnimFrame();
    window.requestAnimationFrame(animFrame);
}

window.requestAnimationFrame(animFrame);
document.addEventListener("keyup", (e: KeyboardEvent) => { game.onKeyUp(e) });
document.addEventListener("mousedown", (e: MouseEvent) => { game.onMouseDown(e) });
document.addEventListener("mousemove", (e: MouseEvent) => { game.onMouseMove(e) });
document.addEventListener("mouseup",   (e: MouseEvent) => { game.onMouseUp(e)   });
document.addEventListener("wheel",     (e: WheelEvent) => { game.onWheel(e)   });

