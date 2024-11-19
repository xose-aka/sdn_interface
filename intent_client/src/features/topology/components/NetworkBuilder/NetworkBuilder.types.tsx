import {Dispatch, SetStateAction} from "react";
import {Edge, Node, OnEdgesChange, OnNodesChange} from "@xyflow/react";


export interface NetworkBuilderProps {
    nodeList: string[],
    selectedNode: Node | null,
    setSelectedNode: Dispatch<SetStateAction<Node | null>>,
    nodes: Node[],
    edges: Edge[],
    setNodes:Dispatch<SetStateAction<Node[]>>,
    setEdges: Dispatch<SetStateAction<Edge[]>>,
    onNodesChange: OnNodesChange<Node>,
    onEdgesChange: OnEdgesChange<Edge>,
    resetNodeSelection: () => void,
    intentHighlightedNodes: Node[]
}
interface SelectableNode {
    id: string
}

