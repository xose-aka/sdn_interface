import {Dispatch, SetStateAction} from "react";
import {Node} from "@xyflow/react";

export interface ChatWindowProps {
    isOpen: boolean,
    onClose: () => void,
    title: string,
    message: string,
    setIntentMessage: Dispatch<SetStateAction<string>>,
    setIntentHighlightedNodes: Dispatch<SetStateAction<Node[]>>,
}