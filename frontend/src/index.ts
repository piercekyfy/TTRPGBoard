import {Board} from './board';
import {Game} from './game';
import { Tool, MoveTool, SelectionTool, DrawTool } from './game/tools';

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
document.addEventListener("mousedown", (e: MouseEvent) => { if(e.target instanceof HTMLCanvasElement ) game.onMouseDown(e) });
document.addEventListener("mousemove", (e: MouseEvent) => { if(e.target instanceof HTMLCanvasElement ) game.onMouseMove(e) });
document.addEventListener("mouseup",   (e: MouseEvent) => { if(e.target instanceof HTMLCanvasElement ) game.onMouseUp(e)   });
document.addEventListener("wheel",     (e: WheelEvent) => { if(e.target instanceof HTMLCanvasElement ) game.onWheel(e)   });


function createToolButton(tool: Tool) {
    const template: string = "<div class='tool-icon'><div class='tooltip'>%title%</div><img src='./edwin.png'></img></div>"
    const parent = document.querySelector('#tool-selector');
    const elm = document.createElement('div');
    elm.className = 'tool-icon';
    elm.innerHTML = template.replace('%title%', tool.title);
    parent?.appendChild(elm);
    const _tool = tool;
    elm.addEventListener('click', () => {
        game.currentTool = _tool;
    });
}

createToolButton(new MoveTool(game));
createToolButton(new SelectionTool(game));
createToolButton(new DrawTool(game));