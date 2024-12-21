import {Dispatch, SetStateAction} from "react";
import {Node} from "@xyflow/react";

export interface ChatWindowProps {
    setShowAlert: Dispatch<SetStateAction<boolean>>,
    setAlertType: Dispatch<SetStateAction<string>>,
    setAlertMessage: Dispatch<SetStateAction<string>>,
    isOpen: boolean,
    token: string | null,
    handleClose: () => void,
    title: string,
    setIntentHighlightedNodes: Dispatch<SetStateAction<Node[]>>,
}