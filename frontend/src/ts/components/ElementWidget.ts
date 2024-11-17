import { Component, ComponentEvent} from "./Component";
import { BoardElement } from "../board/elements";
import { BoardGraphics } from "../board";

export default class ElementWidget extends Component<BoardElement> {
    override className: string = 'element-widget';
    override template: string = "";
    protected override events: ComponentEvent[] = [];
    private attachment = {tag: 'widget', render: this.onElementRender.bind(this)}

    public constructor(data: BoardElement) {
        super(data);
        data.attachGraphic(this.attachment);
    }

    private onElementRender(graphics: BoardGraphics) {
        this.render();
    }

    override render(): HTMLElement {
        this.createElm(Component.simpleTemplateFill(this.template, {}));

        const elm = this.elm as HTMLElement;

        elm.style.left = this.data.x.toString() + 'px';
        elm.style.top = this.data.y.toString() + 'px';
        elm.style.width = this.data.width.toString() + 'px';
        elm.style.height = this.data.height.toString() + 'px';

        return elm;
    }
}