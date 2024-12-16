import {Button, Col, Container, Row} from "react-bootstrap";
import {DndProvider} from "react-dnd";
import {HTML5Backend} from "react-dnd-html5-backend";
import { TouchBackend } from 'react-dnd-touch-backend'

import {Edge, Node, ReactFlowProvider, useEdgesState, useNodesState} from "@xyflow/react";
import React, {useEffect, useState} from "react";
import ListNode from "../../features/topology/components/ListNodeSidebar/ListNode.tsx";
import NetworkBuilder from "../../features/topology/components/NetworkBuilder/NetworkBuilder.tsx";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faComments} from "@fortawesome/free-solid-svg-icons";
import IntentWindow from "../../features/intentChat/components/Window";
import BootstrapAlert from "../../components/BootstrapAlert.tsx";
import {nodeTypes} from "../../constants/topology.ts";
import {alertTypes} from "../../constants";
import NetworkNode from "../../features/topology/components/Node/NetworkNode.tsx";
import NetworkEdge from "../../features/topology/components/NetworkEdge/NetworkEdge.tsx";
import {getReactDnDBackend} from "../../utils/helper.ts";

const  networkNodeTypes = {
    networkNode: NetworkNode
};

const edgeTypes = {
    networkEdge: NetworkEdge
};

const TopologyPage: React.FC = () => {

    const [showAlert, setShowAlert] = useState(false);
    const [alertType, setAlertType] = useState(alertTypes.primary);
    const [alertMessage, setAlertMessage] = useState("");
    const [showSetIPModal, setShowSetIPModal] = useState(false);


    const nodeList = Object.values(nodeTypes)

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

            if (icon.includes(nodeTypes["ROUTER"]) )
                type = nodeTypes["ROUTER"]
            if (icon.includes(nodeTypes["SWITCH"]) )
                type = nodeTypes["SWITCH"]
            if (icon.includes(nodeTypes["HOST"]) )
                type = nodeTypes["HOST"]

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

    useEffect(() => {
        let timeoutId = 0
        if ( showAlert ) {
            timeoutId = setTimeout(() => {
                setShowAlert(prev => !prev)
            }, 3000);

            return () => {
                if (timeoutId !== null)
                    clearTimeout(timeoutId);
            };
        }
    }, [showAlert]);

    const backend = getReactDnDBackend()

    return (
        <div className={'main-container'}>
            {showAlert && (
                <BootstrapAlert
                    message={alertMessage}
                    type={alertType}
                    setShowAlert={setShowAlert}
                />
            )}
            <Container fluid={true} >
                <Row className={'vh-100'}>
                    <DndProvider backend={ backend }
                                 options={{ enableMouseEvents: true }}
                    >
                        <Col
                            sm={12}
                            md={3}
                            xl={2}
                             className={'border-end bg-light "h-sm-30'}
                             onClick={ () => resetNodeSelection() }>
                            <ListNode
                                nodeList={nodeList}
                                resetNodeSelection={() => resetNodeSelection()}
                            />
                        </Col>
                        <Col className="h-sm-70">
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
                                    networkNodeTypes={networkNodeTypes}
                                    edgeTypes={edgeTypes}
                                />
                            </ReactFlowProvider>
                            <IntentWindow
                                setShowAlert={setShowAlert}
                                setAlertType={setAlertType}
                                setAlertMessage={setAlertMessage}
                                isOpen={isOpen}
                                handleClose={handleClose}
                                title="Intent Window"
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