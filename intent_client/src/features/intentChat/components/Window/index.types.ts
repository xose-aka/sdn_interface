import {Dispatch, SetStateAction} from "react";
import {Node} from "@xyflow/react";
import {AppliedIntentResult} from "../../../../types";

export interface ChatWindowProps {
    setShowAlert: Dispatch<SetStateAction<boolean>>,
    setAlertType: Dispatch<SetStateAction<string>>,
    setAlertMessage: Dispatch<SetStateAction<string>>,
    isOpen: boolean,
    token: string | null,
    handleClose: () => void,
    applyIntentToNode: (appliedIntentResult: AppliedIntentResult) => void,
    title: string,
    setIntentHighlightedNodes: Dispatch<SetStateAction<Node[]>>,
}