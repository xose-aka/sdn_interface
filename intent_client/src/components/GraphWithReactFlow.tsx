import React, { useCallback, useEffect, useState} from "react";
import {useDrop} from "react-dnd";
import {getNodeSvg, isObjectEmpty} from "../helper.ts";
import {Button} from "react-bootstrap";
import {addEdge, Controls, ReactFlow, useEdgesState, useNodesState, useReactFlow} from "@xyflow/react";
import NetworkNode from './NetworkNode.tsx';
import ButtonEdge from './ButtonEdge';
import moment from "moment";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import messageDate from "../messages.json";

const nodeTypes = {
    selectorNode: NetworkNode,
};

const connectionLineStyle = { stroke: "#0a0a0a" };

const defaultViewport = { x: 0, y: 0, zoom: 1 };

import CustomConnectionLine from './CustomConnectionLine';
import ChatWindow from "./ChatWindow.tsx";
import {faComments} from "@fortawesome/free-solid-svg-icons";

const defaultEdgeOptions = {
    style: { strokeWidth: 3, stroke: 'black' },
    type: 'buttonedge'
};

interface GraphProps {
    nodeList: string[],
    setSelectedNode: (node: object) => void,
    setSelectedEdge: (edgeId: string) => void,
    setSelections: (id: string[]) => void,
    selectedNode: object,
    selectedEdge: string,
    selections: string[],
    resetNodeSelection: () => void
}
export default function GraphWithReactFlow(
    {
        nodeList,
        setSelections,
        selectedEdge,
        selections,
        resetNodeSelection
    }: GraphProps) {

    const [nodeCounter, setNodeCounter] = useState(1)

    const [nodes, setNodes, onNodesChange] = useNodesState([])

    const [selectedNode, setSelectedNode] = React.useState<object>({})

    const [edges, setEdges, onEdgesChange] = useEdgesState(
        [
            // {
            //     id: '1->2',
            //     source: 'n-1',
            //     target: 'n-2',
            //     label: 'Edge 1-2'
            // }
        ]
    )

    const [isOpen, setIsOpen] = useState(false);

    const handleDeleteKeyPress = (event: KeyboardEvent) => {
        if (event.key === 'Delete') {
            console.log(selectedNode, edges)

            if ( !isObjectEmpty(selectedNode) )
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

    useEffect(() => {
        // Add the event listener
        window.addEventListener('keydown', handleDeleteKeyPress);

        // Clean up the event listener on component unmount
        return () => {
            window.removeEventListener('keydown', handleDeleteKeyPress);
        };
    }, [selectedNode, selectedEdge]);

    const handleClose = () => {
        setIsOpen(false);
    };

    const buildTopology = () => {

        setIsOpen(!isOpen)

        let topologyNodes = []

        nodes.forEach(node => {

            let type = ''

            if (node.data.icon.includes('router') )
                type = 'router'
            if (node.data.icon.includes('switch') )
                type = 'switch'
            if (node.data.icon.includes('server') )
                type = 'host'

            const neighbours = edges.filter(edge => {
                return edge.source === node.id || edge.target === node.id;

            })
                .map(edge => {
                    if (edge.source === node.id)
                        return edge.target

                    if (edge.target === node.id)
                        return edge.source
                })

            const newTopologyNode = {
                type: type,
                id: node.id,
                neighbors: neighbours
            }

            topologyNodes.push(newTopologyNode)

        })

        console.log(topologyNodes)

    }

    const { screenToFlowPosition } = useReactFlow();


    const onConnect = useCallback(
        (params) => {

            setEdges((eds) => addEdge(
                { ...params },
                eds))
        },
        []
    );

    const edgeTypes = {
        buttonedge: ButtonEdge,
    };


    const [, drop] = useDrop(
        () => ({
            accept: nodeList,
            drop: (item) => {
                const icon = getNodeSvg(item.title)

                const newNode = {
                    id: `${nodeCounter}`,
                    label: `${nodeCounter}`,
                    type: 'selectorNode',
                    data: {
                        icon: icon,
                        label: `${item.title} ${nodeCounter}`,
                        selectedNode: selectedNode,
                        isThisNodeClicked: false
                    },
                    position: screenToFlowPosition({
                        x: event.clientX,
                        y: event.clientY,
                    }),
                    sourcePosition: 'right'
                }


                setNodes([...nodes, newNode])
                setNodeCounter(nodeCounter + 1)
            }
        }),
        [nodes]
    )

    const onNodeClick = (event, clickedNode) => {

        setSelectedNode(clickedNode)

        const newNodes = nodes.map((node) => {

            node.data.isThisNodeClicked = clickedNode.id === node.id;

            return node
        })

        setNodes(newNodes)
    }

    const onPaneClick = (event) => {
        setSelectedNode({})

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

    return (
        <div className={'graph-container h-100'}
             ref={drop}
             style={
                 {
                     position: "relative"
                 }
             }
        >
            <Button
                style={
                    {
                        position: "relative",
                        float: "right",
                        zIndex: 1000,
                        top: "20px"

                    }
                }
                variant="primary" onClick={() => buildTopology(!isOpen) }>
                <FontAwesomeIcon icon={faComments} />
                <span className="m-1">Input Intent </span>
            </Button>


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
                    // attributionPosition="bottom-left"
                >
                    <Controls />
                </ReactFlow>

            <ChatWindow
                isOpen={isOpen}
                onClose={handleClose}
                title="Intents  Window  "
            />
        </div>
    );
}