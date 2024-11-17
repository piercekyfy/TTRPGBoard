import BoardGraphics from "./BoardGraphics"
import { BoardElement } from "./elements"

export type BoardGraphic = { 
    tag: string, 
    render: (graphics: BoardGraphics, caller?: BoardElement) => void
}