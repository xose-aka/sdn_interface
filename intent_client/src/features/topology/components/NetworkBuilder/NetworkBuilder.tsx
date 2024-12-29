import React, { useCallback} from "react";
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
import CustomConnectionLine from '../CustomConnectionLine/CustomConnectionLine.tsx';
import {NetworkBuilderProps} from "./NetworkBuilder.types.tsx";
import SetIPModal from "../SetIPModal";
import {SetIPModalProvider} from "../SetIPModalProvider";


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
        resetNodeSelection,
        networkNodeTypes,
        edgeTypes
    }: NetworkBuilderProps ) {

    const { screenToFlowPosition } = useReactFlow();

    const handleDeleteKeyPress = (event: React.KeyboardEvent) => {

        if (event.key === 'Delete') {

            if ( selectedNode !== null )
            {
                if (confirm(`Do you want to really remove node ${selectedNode.data.lavel}`)) {
                    const newEdges = edges.filter(edge => !( edge.source == selectedNode.id ||
                        edge.target == selectedNode.id))
                    setEdges(newEdges)

                    const newNodes = nodes.filter(node => node.id !== selectedNode.id)
                    setNodes(newNodes)

                    // Perform your delete action here
                    resetNodeSelection()
                }
            }
        }
    };

    const onConnect = useCallback(
        (params: Connection) => {
            setEdges((eds) => addEdge(
                { ...params, data: {} },
                eds))
        },
        []
    );

    const [, drop] = useDrop(
        () => ({
            accept: nodeList,
            drop: (item: DraggableNode, monitor) => {
                const clientOffset = monitor.getClientOffset();
                const type = item.type

                const icon = getNodeSvg(type)

                let coordinates = {
                    x: 0,
                    y: 0
                }

                if (clientOffset) {
                    const { x, y } = clientOffset;
                    coordinates.x = x
                    coordinates.y = y
                }

                let counter = 0
                let isCounterNumberAlreadySet

                do {

                    isCounterNumberAlreadySet = false
                    counter++

                    for (const itemNode of nodes) {

                        if (itemNode.data.nodeType === type) {
                            if (itemNode.id == `${type}${counter}`)
                                isCounterNumberAlreadySet = true
                        }
                    }


                } while(isCounterNumberAlreadySet)

                const newNode: Node = {
                    id: `${type}${counter}`,
                    type: 'networkNode',
                    data: {
                        icon: icon,
                        nodeType: type,
                        label: `${type} ${counter}`,
                        selectedNode: selectedNode,
                        isThisNodeClicked: false
                    },
                    position: screenToFlowPosition(coordinates)
                }

                setNodes([...nodes, newNode])
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
        <div className="graph-container h-100 position-relative cursor-progress" ref={drop} onKeyDown={handleDeleteKeyPress}>
            <SetIPModalProvider>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    nodeTypes={networkNodeTypes}
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
                <SetIPModal/>
            </SetIPModalProvider>
        </div>
    );
}