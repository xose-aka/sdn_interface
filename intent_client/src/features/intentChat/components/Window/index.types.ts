import {Dispatch, SetStateAction} from "react";
import {Node} from "@xyflow/react";
import {ConfirmationIntentResponse} from "../../../../types";

export interface ChatWindowProps {
    showAlertHandler: (type: string, message: string) => void,
    isOpen: boolean,
    token: string | null,
    setToken: Dispatch<SetStateAction<string | null>>,
    handleClose: () => void,
    applyIntentToNode: (confirmationIntentResponse: ConfirmationIntentResponse) => void,
    title: string,
    setIntentHighlightedNodes: Dispatch<SetStateAction<Node[]>>,
    isTopologyChanged: boolean,
}