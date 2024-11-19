import {Button, Col, Container, Row} from "react-bootstrap";
import {DndProvider} from "react-dnd";
import {HTML5Backend} from "react-dnd-html5-backend";

import {Edge, Node, ReactFlowProvider, useEdgesState, useNodesState} from "@xyflow/react";
import React, {useEffect, useState} from "react";
import ListNode from "../../features/topology/components/ListNodeSidebar/ListNode.tsx";
import NetworkBuilder from "../../features/topology/components/NetworkBuilder/NetworkBuilder.tsx";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faComments} from "@fortawesome/free-solid-svg-icons";
import IntentWindow from "../../features/intentChat/components/Window";


const TopologyPage: React.FC = () => {

    const nodeList = ["router", "switch", "server"]

    const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])

    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(
        [
            // {
            //     id: '1->2',
            //     source: 'n-1',
            //     target: 'n-2',
            //     label: 'Edge 1-2'
            // }
        ]
    )

    const [selectedNode, setSelectedNode] = React.useState<Node | null>(null)

    const [intentHighlightedNodes, setIntentHighlightedNodes] = React.useState<Node[]>([])

    const [message, setIntentMessage] = useState("");

    const resetNodeSelection = () => {
        setSelectedNode(null)
    }

    const [isOpen, setIsOpen] = useState(false);

    const [isShowIntentButton, setIsShowIntentButton] = useState(false);

    const buildTopology = () => {

        setIsOpen(!isOpen)

        let topologyNodes: object[] = []

        nodes.forEach(node => {

            const icon: string = node.data.icon as string

            let type = ''

            if (icon.includes('router') )
                type = 'router'
            if (icon.includes('switch') )
                type = 'switch'
            if (icon.includes('server') )
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

    const handleClose = () => {
        setIsOpen(false);
    };

    useEffect(() => {
        document.title = 'Topology build';
    }, []);

    useEffect(() => {
        if ( nodes.length > 0 ) {
            setIsShowIntentButton(true)
        } else {
            setIsShowIntentButton(false)
        }
    }, [JSON.stringify(nodes)]);

    return (
        <div className={'main-container'}>
            <Container fluid={true} >
                <Row className={'h-100'}>
                    <DndProvider backend={HTML5Backend}>
                        <Col xs={2} className={'border-end bg-light'}
                             onClick={ () => resetNodeSelection() }>
                            <ListNode
                                nodeList={nodeList}
                                resetNodeSelection={() => resetNodeSelection()}
                            />
                        </Col>
                        <Col xs={10}>
                            <Button  className="position-relative float-end z-3"
                                style={{
                                    top: "20px",
                                    display: isShowIntentButton ? "block" : "none"
                                }}
                                variant="primary" onClick={() => buildTopology() }>
                                <FontAwesomeIcon icon={faComments} />
                                <span className="m-1">Input Intent </span>
                            </Button>
                            <ReactFlowProvider>
                                <NetworkBuilder
                                    nodeList={nodeList}
                                    selectedNode={selectedNode}
                                    setSelectedNode={setSelectedNode}
                                    nodes={nodes}
                                    edges={edges}
                                    setNodes={setNodes}
                                    setEdges={setEdges}
                                    onNodesChange={onNodesChange}
                                    onEdgesChange={onEdgesChange}
                                    resetNodeSelection={resetNodeSelection}
                                    intentHighlightedNodes={intentHighlightedNodes}
                                />
                            </ReactFlowProvider>
                            <IntentWindow
                                isOpen={isOpen}
                                onClose={handleClose}
                                title="Intent Window"
                                message={message}
                                setIntentMessage={setIntentMessage}
                                setIntentHighlightedNodes={setIntentHighlightedNodes}
                            />
                        </Col>
                    </DndProvider>
                </Row>
            </Container>
        </div>
    );
};

export default TopologyPage