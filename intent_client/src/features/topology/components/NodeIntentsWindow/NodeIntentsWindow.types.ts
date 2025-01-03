import {Node} from "@xyflow/react";

export interface NodeIntentsWindowProps {
    isOpen: boolean,
    handleClose: () => void,
    selectedNode: Node | null,

}