import {Dispatch, SetStateAction} from "react";
import {Node} from "@xyflow/react";
import {alertTypes} from "../../../../constants/topology.ts";

export interface ChatWindowProps {
    setShowAlert: Dispatch<SetStateAction<boolean>>,
    setAlertType: Dispatch<SetStateAction<alertTypes>>,
    setAlertMessage: Dispatch<SetStateAction<string>>,
    isOpen: boolean,
    handleClose: () => void,
    title: string,
    setIntentHighlightedNodes: Dispatch<SetStateAction<Node[]>>,
}