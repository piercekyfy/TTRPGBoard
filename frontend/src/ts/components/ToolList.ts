import { Component } from "./Component";
import ToolIcon from "./ToolIcon";
import { Tool } from "../game/tools";
import { Game } from "../game";


export default class ToolList extends Component<Tool[]> {
    override className: string = 'tools-body';
    override template: string = "";
    private game!: Game;
    private tools: ToolIcon[] = [];

    public constructor(data: Tool[], game: Game) {
        super(data);
        this.game = game;
        for(const tool of data) {
            const icon = new ToolIcon(tool, this);
            this.tools.push(icon);
        }
    }

    override render(): HTMLElement {
        this.createElm(this.template);

        for(const toolIcon of this.tools) {
            this.elm?.appendChild(toolIcon.render());
        }

        return this.elm as HTMLElement;
    }

    public onToolIconSelected(toolIcon: ToolIcon) {
        this.tools.forEach(t => t.setSelected(false));
        toolIcon.setSelected(true);
        this.game.selectTool(toolIcon.data);
    }
}