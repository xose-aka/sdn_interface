import React, { useCallback, useState} from "react";
import {useDrop} from "react-dnd";
import {getNodeSvg} from "../../../../utils/node.ts";
import {
    addEdge,
    Controls,
    ReactFlow,
    useReactFlow,
    Node,
    Connection
} from "@xyflow/react";
import NetworkEdge from '../NetworkEdge/NetworkEdge.tsx';
import NetworkNode from '../Node/NetworkNode.tsx';
import CustomConnectionLine from '../CustomConnectionLine/CustomConnectionLine.tsx';
import {NetworkBuilderProps} from "./NetworkBuilder.types.tsx";

const  nodeTypes = {
    networkNode: NetworkNode,
};

const edgeTypes = {
    networkEdge: NetworkEdge,
};

const connectionLineStyle = { stroke: "#0a0a0a" };

const defaultViewport = { x: 0, y: 0, zoom: 1 };

const defaultEdgeOptions = {
    style: { strokeWidth: 3, stroke: 'black' },
    type: 'networkEdge'
};

export default function NetworkBuilder(
    {
        nodeList,
        selectedNode,
        setSelectedNode,
        nodes,
        edges,
        setNodes,
        setEdges,
        onNodesChange,
        onEdgesChange,
        resetNodeSelection
    }: NetworkBuilderProps ) {

    const { screenToFlowPosition } = useReactFlow();

    const [nodeCounter, setNodeCounter] = useState(1)

    const handleDeleteKeyPress = (event: React.KeyboardEvent) => {

        if (event.key === 'Delete') {
            console.log(selectedNode, edges)

            if ( selectedNode !== null )
            {
                const newEdges = edges.filter(edge => !( edge.source == selectedNode.id ||
                                                                        edge.target == selectedNode.id))
                setEdges(newEdges)

                const newNodes = nodes.filter(node => node.id !== selectedNode.id)
                setNodes(newNodes)
            }

            // Perform your delete action here
            resetNodeSelection()
        }
    };

    const onConnect = useCallback(
        (params: Connection) => {

            setEdges((eds) => addEdge(
                { ...params },
                eds))
        },
        []
    );

    const [, drop] = useDrop(
        () => ({
            accept: nodeList,
            drop: (item: DraggableNode, monitor) => {
                const clientOffset = monitor.getClientOffset();
                const icon = getNodeSvg(item.title)

                let coordinates = {
                    x: 0,
                    y: 0
                }

                if (clientOffset) {
                    const { x, y } = clientOffset;
                    coordinates.x = x
                    coordinates.y = y
                }

                const newNode: Node = {
                    id: `${nodeCounter}`,
                    type: 'networkNode',
                    data: {
                        icon: icon,
                        label: `${item.title} ${nodeCounter}`,
                        selectedNode: selectedNode,
                        isThisNodeClicked: false
                    },
                    position: screenToFlowPosition(coordinates)
                }


                setNodes([...nodes, newNode])
                setNodeCounter(nodeCounter + 1)
            }
        }),
        [nodes]
    )

    const onNodeClick = (event: React.MouseEvent, clickedNode: Node) => {

        setSelectedNode(clickedNode)

        const newNodes = nodes.map((node) => {

            node.data.isThisNodeClicked = clickedNode.id === node.id;

            return node
        })

        setNodes(newNodes)
    }

    const onPaneClick = (event: React.MouseEvent) => {
        resetNodeSelection()

        const newNodes = nodes.map((node) => {
            node.data.isThisNodeClicked = false;
            return node
        })

        setNodes(newNodes)
    }

    // const handleMessageSent = message => {
    //     setMessages([
    //         ...messages,
    //         { ...message, dateTimeStamp: moment().format("LLLL") }
    //     ]);
    // };

    // useEffect(() => {
    //     // Add the event listener
    //     window.addEventListener('keydown', handleDeleteKeyPress);
    //
    //     // Clean up the event listener on component unmount
    //     return () => {
    //         window.removeEventListener('keydown', handleDeleteKeyPress);
    //     };
    // }, [selectedNode, selectedEdge]);

    return (
        <div className="graph-container h-100 position-relative" ref={drop} onKeyDown={handleDeleteKeyPress}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    nodeTypes={nodeTypes}
                    edgeTypes={edgeTypes}
                    connectionLineStyle={connectionLineStyle}
                    connectionLineComponent={CustomConnectionLine}
                    defaultViewport={defaultViewport}
                    onNodeClick={onNodeClick}
                    onPaneClick={onPaneClick}
                    defaultEdgeOptions={defaultEdgeOptions}
                >
                    <Controls />
                </ReactFlow>


        </div>
    );
}