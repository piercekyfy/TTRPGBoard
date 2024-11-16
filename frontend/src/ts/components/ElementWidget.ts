import { Component, ComponentEvent} from "./Component";
import { SelectableElement } from "../board/elements";

export default class ElementWidget extends Component<SelectableElement> {
    override className: string = 'element-widget';
    override template: string = "";
    protected override events: ComponentEvent[] = [];

    public constructor(data: SelectableElement) {
        super(data);
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