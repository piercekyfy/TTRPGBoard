import './css/index.css';

import {Board} from './ts/board';
import {Game} from './ts/game';
import { Tool, MoveTool, SelectionTool, DrawTool } from './ts/game/tools';
import { ToolList } from './ts/components';
import ElementWidget, { WidgetData } from './ts/components/ElementWidget';
import ScaleWidget from './ts/components/ScaleWidget';
import TitleWidget from './ts/components/TitleWidget';

const imgEdwin: HTMLImageElement = document.getElementById('img-edwin') as HTMLImageElement;
const canvas: HTMLCanvasElement = document.getElementById('game') as HTMLCanvasElement;

const board: Board = new Board(canvas, document.documentElement.clientWidth, document.documentElement.clientHeight);

let token = board.createToken(1, 64,64, imgEdwin, 64, 64);
let token2 = board.createToken(1, 128,64, imgEdwin, 128, 128);
let token3 = board.createToken(1, 32,64, imgEdwin, 64, 64);

const game = new Game(board);

function animFrame() {
    game.onAnimFrame();
    window.requestAnimationFrame(animFrame);
}

window.requestAnimationFrame(animFrame);
document.addEventListener("keyup", (e: KeyboardEvent) => { game.onKeyUp(e) });
document.addEventListener("mousedown", (e: MouseEvent) => { if(e.target instanceof HTMLCanvasElement) game.onMouseDown(e) });
document.addEventListener("mousemove", (e: MouseEvent) => { game.onMouseMove(e) });
document.addEventListener("mouseup",   (e: MouseEvent) => { game.onMouseUp(e)   });
document.addEventListener("wheel",     (e: WheelEvent) => {  game.onWheel(e)   });

const toolList: ToolList = new ToolList([new MoveTool(game), new SelectionTool(game), new DrawTool(game)], game); // Perhaps replace with a factory that creates a new Tool when the Game needs it. So that Game can give itself as a dependency.
document.querySelector('#tools-body')?.replaceWith(toolList.render());

//const wid = new TitleWidget({ parent: token2, default: '', editable: true });
//document.body.appendChild(wid.render());