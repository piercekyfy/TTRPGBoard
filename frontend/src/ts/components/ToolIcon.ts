import { Component, ComponentEvent} from "./Component";
import { Tool } from "../game/tools";
import ToolList from "./ToolList";


export default class ToolIcon extends Component<Tool> {
    override className: string = 'tool';
    override template: string = "<div class='tooltip'>%title%</div><img src=%image%></img>";
    protected override events: ComponentEvent[] = [{ selector: null, event: 'click', action: this.onClick}];
    private toolList: ToolList|null = null;

    public constructor(data: Tool, toolList: ToolList|null = null) {
        super(data);
        this.toolList = toolList;
    }

    override render(): HTMLElement {
        this.createElm(Component.simpleTemplateFill(this.template, { "title" : this.data.title, "image" : this.data.imageURL }));

        return this.elm as HTMLElement;
    }

    public onClick() {
        if(this.toolList)
            this.toolList.onToolIconSelected(this);
    }

    public setSelected(value: boolean) {
        if(value)
            this.elm?.classList.remove('selected');
        else
            this.elm?.classList.add('selected');
    }
}