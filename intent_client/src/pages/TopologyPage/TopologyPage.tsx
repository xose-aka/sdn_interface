import {Button, Col, Container, Row} from "react-bootstrap";
import {DndProvider} from "react-dnd";

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
import {sendTopo} from "../../services/api.ts";
import useToken from "../../hooks";
import {AppliedIntentResult, Neighbour, TopoEntityDTO} from "../../types";

const  networkNodeTypes = {
    networkNode: NetworkNode
};

const edgeTypes = {
    networkEdge: NetworkEdge
};

const TopologyPage: React.FC = () => {

    /*
     {
       "nodes":
               [
                   {
                        "id": "s1",
                        "neighbors": [
                                       {
                                           "node_id":"s1",
                                           "connection_ip": "ip mask"
                                       },
                                       {
                                           "node_id":"s1",
                                           "connection_ip": null
                                       }
                                      ],
                       "type": "host"
                      }
                 ]
     */

    const [showAlert, setShowAlert] = useState(false);
    const [alertType, setAlertType] = useState(alertTypes.primary);
    const [alertMessage, setAlertMessage] = useState("");
    // const [token, setToken] = useState<string | null>(null);

    const { token, setResetToken } = useToken()

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

        const newNodes = nodes.map((node) => {
            node.data.isThisNodeClicked = false;
            return node
        })

        setNodes(newNodes)

        setSelectedNode(null)
    }

    const [isOpen, setIsOpen] = useState(false);

    const [isShowIntentButton, setIsShowIntentButton] = useState(false);

    const applyIntentToNode = (appliedIntentResult: AppliedIntentResult) => {
        console.log("appliedIntentResult ", appliedIntentResult)
        const nodeId = appliedIntentResult.nodeId

        setNodes((prevNodes) => {

            prevNodes.map((node) => {
                console.log('ff')

                console.log(node.id, nodeId)

                if ( node.id == nodeId ) {
                    console.log('aa')

                    if (Array.isArray(node.data.appliedIntetns)) {
                        console.log('haha')
                        node.data.appliedIntetns.push(appliedIntentResult.message)
                    }
                    else {
                        let newAppliedIntents: string[] = []
                        newAppliedIntents.push(appliedIntentResult.message)
                        node.data.appliedIntetns = newAppliedIntents
                    }
                }
                return node
            })

            return prevNodes
        })
    }

    const buildTopology = () => {

        setIsOpen(!isOpen)

        resetNodeSelection()

        let topologyNodes: TopoEntityDTO[] = []

        nodes.forEach(node => {

            let neighbours: Neighbour[] = []

            let type = ''

            if (node.data.nodeType == nodeTypes["ROUTER"] )
                type = nodeTypes["ROUTER"]
            if (node.data.nodeType == nodeTypes["SWITCH"] )
                type = nodeTypes["SWITCH"]
            if (node.data.nodeType == nodeTypes["HOST"] )
                type = nodeTypes["HOST"]

            neighbours = edges.filter(edge => {
                return edge.source === node.id || edge.target === node.id;
            })
                .map(edge => {
                    if (edge.source === node.id)
                        return {
                            "node": edge.target,
                            "connection_ip": edge.data && edge.data.sourceIPAddress && edge.data.mask ? edge.data.sourceIPAddress as string + "/" + edge.data.mask : null
                        }

                    if (edge.target === node.id)
                        return {
                            "node": edge.source,
                            "connection_ip": edge.data && edge.data.targetIPAddress && edge.data.mask ? edge.data.targetIPAddress as string + "/" + edge.data.mask : null
                        }
                })
                .filter((result): result is Neighbour => result !== undefined && result !== null);

            const newTopologyNode = {
                type: type,
                id: node.id,
                label: node.data.label as string,
                neighbours: neighbours
            }

            topologyNodes.push(newTopologyNode)

        })

        if (token) {
            sendTopo(token, topologyNodes)
                .then(r => {
                    console.log(r)
                })
        }


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
                                token={token}
                                title="Intent Window"
                                setIntentHighlightedNodes={setIntentHighlightedNodes}
                                applyIntentToNode={applyIntentToNode}
                            />
                        </Col>
                    </DndProvider>
                </Row>
            </Container>
        </div>
    );
};

export default TopologyPage