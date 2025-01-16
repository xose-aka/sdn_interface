import {Dispatch, SetStateAction} from "react";
import {Node} from "@xyflow/react";
import {AppliedIntentResult} from "../../../../types";

export interface ChatWindowProps {
    showAlertHandler: (type: string, message: string) => void,
    isOpen: boolean,
    token: string | null,
    setToken: Dispatch<SetStateAction<string | null>>,
    handleClose: () => void,
    applyIntentToNode: (appliedIntentResult: AppliedIntentResult) => void,
    title: string,
    setIntentHighlightedNodes: Dispatch<SetStateAction<Node[]>>,
    isTopologyChanged: boolean,
}