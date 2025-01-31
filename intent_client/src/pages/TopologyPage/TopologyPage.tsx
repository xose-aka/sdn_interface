import {Button, Col, Container, Row, Spinner} from "react-bootstrap";
import {DndProvider} from "react-dnd";

import {Edge, Node, ReactFlowProvider, useEdgesState, useNodesState} from "@xyflow/react";
import React, { useEffect, useState} from "react";
import NodeList from "../../features/topology/components/SidebarNodeList/NodeList.tsx";
import NetworkBuilder from "../../features/topology/components/NetworkBuilder/NetworkBuilder.tsx";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCircleNodes, faComments, faXmark} from "@fortawesome/free-solid-svg-icons";
import IntentWindow from "../../features/intentChat/components/Window";
import BootstrapAlert from "../../components/BootstrapAlert.tsx";
import {nodeTypes} from "../../constants/topology.ts";
import {alertTypes} from "../../constants";
import NetworkNode from "../../features/topology/components/Node/NetworkNode.tsx";
import NetworkEdge from "../../features/topology/components/NetworkEdge/NetworkEdge.tsx";
import {getReactDnDBackend} from "../../utils/helper.ts";
import {getToken, sendTopology} from "../../services/api.ts";
import useToken from "../../hooks";
import {
    ConfirmationIntentResponse,
    Neighbour,
    TopoEntityDTO,
    UpdateTopologyResponse
} from "../../types";
import NodeIntentsWindow from "../../features/topology/components/NodeIntentsWindow/NodeIntentsWindow.tsx";

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

    const { token, setToken } = useToken()

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

    const [prevEdges, setPrevEdges] = useState<Edge[]>([])


    const [selectedNode, setSelectedNode] = React.useState<Node | null>(null)

    const [selectedIntentHistoryNode, setSelectedIntentHistoryNode] = React.useState<Node | null>(null)

    const [intentHighlightedNodes, setIntentHighlightedNodes] = React.useState<Node[]>([])
    const [isUploadingTopology, setIsUploadingTopology] = React.useState<boolean>(false)

    const resetNodeSelection = () => {

        const newNodes = nodes.map((node) => {
            node.data.isThisNodeClicked = false;
            return node
        })

        setNodes(newNodes)

        setSelectedNode(null)
    }

    const [isIntentCommunicationOpen, setIsIntentCommunicationOpen] = useState(false);
    const [isNodeIntentHistoryOpen, setIsNodeIntentHistoryOpen] = useState(false  );

    const [isTopologyChanged, setIsTopologyChanged] = useState(true);

    const applyIntentToNode = (confirmationIntentResponse: ConfirmationIntentResponse) => {

        const nodeId = confirmationIntentResponse.nodeId

        setNodes((prevNodes) => {

            prevNodes.map((node) => {
                if ( node.id == nodeId ) {

                    const appliedIntentResult = {
                        intent: confirmationIntentResponse.message,
                        date: confirmationIntentResponse.timestamp
                    }

                    if (Array.isArray(node.data.appliedIntents)) {
                        node.data.appliedIntents.push(appliedIntentResult)
                    } else {
                        let newAppliedIntents: ConfirmationIntentResponse[] = []
                        newAppliedIntents.push(confirmationIntentResponse)
                        node.data.appliedIntents = newAppliedIntents
                    }
                }
                return node
            })

            return prevNodes
        })
    }

    const handleOpenNodeIntentHistory = () => {
        setIsNodeIntentHistoryOpen(!isNodeIntentHistoryOpen)
    }

    const showAlertHandler = (type: string, message: string) => {
        setShowAlert(true)
        setAlertType(type)
        setAlertMessage(message)
    }

    const updateTopology = () => {

        setIsUploadingTopology(true)

        let topologyNodes: TopoEntityDTO[] = []

        nodes.forEach(node => {

            let neighbours: Neighbour[]

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
            sendTopology(token, topologyNodes)
                .then(result => {
                    topologyUpdateResponse(result)
                })
        } else {
            getToken()
                .then(response => {
                    setToken(response.data.token)

                    sendTopology(response.data.token, topologyNodes)
                        .then(result => {
                            topologyUpdateResponse(result)
                        })
                })
                .catch(error => {
                    showAlertHandler(alertTypes.warning, `Could not fetch token, error: ${error}`)
                });
        }
    }

    const topologyUpdateResponse = (result: UpdateTopologyResponse) => {

        if (result.error) {
            showAlertHandler(alertTypes.success, `Topology updated`)
            setIsUploadingTopology(false)
            setPrevEdges( JSON.parse(JSON.stringify(edges)) )
        } else {
            showAlertHandler(alertTypes.success, `Topology updated`)
            setIsUploadingTopology(false)
            setIsTopologyChanged(false)
            setPrevEdges( JSON.parse(JSON.stringify(edges)) )

            let preparedNodeInterfaces: { [key: string]: { [key: string]: string } } = {}


            for( const node_interface in result.data.topology_interfaces.nodes_interfaces) {
                const neighbour_node_interface = result.data.topology_interfaces.nodes_interfaces[node_interface]

                const [nodeId, interfaceId] = node_interface.split("-");
                const [neighbourNodeId, neighbourInterfaceId] = neighbour_node_interface.split("-");

                if ( !( nodeId in preparedNodeInterfaces) ) {
                    preparedNodeInterfaces[nodeId] = {}
                }

                preparedNodeInterfaces[nodeId][interfaceId] = neighbourNodeId

            }

            const nodes_intents = result.data.nodes_intents

            // set node intent history
            setNodes((prevNodes) => {

                prevNodes.map((node) => {

                    if ( node.id in nodes_intents) {
                        for( const nodeId in nodes_intents) {
                            const appliedIntents = nodes_intents[nodeId]

                            if ( node.id == nodeId ) {
                                node.data.appliedIntents = appliedIntents
                            }
                        }
                    } else {
                        node.data.appliedIntents = undefined
                    }

                    return node
                })

                return prevNodes
            })
            
            setEdges((prevEdges) => {

                prevEdges.map((edge) => {
                    if ( edge.source in preparedNodeInterfaces ) {


                        for( const node_interface in preparedNodeInterfaces[edge.source]) {

                            const neighbourNodeId = preparedNodeInterfaces[edge.source][node_interface]

                            if (neighbourNodeId == edge.target) {
                                edge.data = edge.data ?? {};
                                edge.data.sourcePort = `Port ${node_interface.toString().replace(/\D/g, '')}`
                            }

                        }
                    }

                    if ( edge.target in preparedNodeInterfaces ) {


                        for( const node_interface in preparedNodeInterfaces[edge.target]) {

                            const neighbourNodeId = preparedNodeInterfaces[edge.target][node_interface]

                            if (neighbourNodeId == edge.source) {
                                edge.data = edge.data ?? {};
                                edge.data.targetPort = `Port ${node_interface.toString().replace(/\D/g, '')}`
                            }

                        }
                    }

                    return edge
                })

                return prevEdges
            })
        }
    }

    const openIntentCommunication = () => {

        if (token) {
            setIsIntentCommunicationOpen(!isIntentCommunicationOpen)
            resetNodeSelection()
        } else {
            getToken()
                .then(response => {
                    setToken(response.data.token)
                    setIsIntentCommunicationOpen(!isIntentCommunicationOpen)
                    resetNodeSelection()
                })
                .catch(error => {
                    showAlertHandler(alertTypes.warning, `Could not fetch token, error: ${error}`)
                });
        }
    }

    const cancelUpdateTopology = () => {
        setIsUploadingTopology(false);
    };

    const handleClose = () => {
        setIsIntentCommunicationOpen(false);
    };

    const handleCloseNodeIntentHistory = () => {
        setIsNodeIntentHistoryOpen(false);
    };

    useEffect(() => {
        document.title = 'Topology build';
    }, []);

    useEffect(() => {
        if ( nodes.length > 0 ) {
            setIsTopologyChanged(true)
        }
    }, [nodes.length]);

    useEffect(() => {
        if (edges.length > 0 ) {

            const prevEdgesString = JSON.stringify(prevEdges, (key, value) => {
                // Exclude the 'selected' field
                if (key === 'selected') {
                    return undefined; // Returning `undefined` will skip the field
                }
                return value; // Return other fields as usual
            });

            const edgesString = JSON.stringify(edges, (key, value) => {
                // Exclude the 'selected' field
                if (key === 'selected') {
                    return undefined; // Returning `undefined` will skip the field
                }
                return value; // Return other fields as usual
            });

            const hasChanged = edgesString !== prevEdgesString

            if (hasChanged) {
                setIsTopologyChanged(true)
            }
        }
    }, [edges]);

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

    useEffect(() => {
        if (selectedNode) {
            setSelectedIntentHistoryNode(selectedNode)
        }
    }, [selectedNode]);

    return (
        // <div className={'main-container'}>

            <Container
                fluid={true}
                className={'vh-100'}
            >
                {
                    showAlert && (
                        <BootstrapAlert
                            message={alertMessage}
                            type={alertType}
                            setShowAlert={setShowAlert}
                        />
                    )
                }
                <Row className={'vh-100'}>
                    <DndProvider backend={ backend }
                                 options={{ enableMouseEvents: true }}>
                        <Col
                            sm={12}
                            md={3}
                            xl={2}
                             className={'border-end bg-light "h-sm-30'}
                             // onClick={ () => resetNodeSelection() }
                        >
                            <div className="d-flex flex-column vh-100">
                                <div className="flex-md-grow-1">
                                    <NodeList
                                        nodeList={nodeList}
                                    />
                                </div>
                                <div className="d-flex flex-column flex-md-grow-1">
                                    {
                                        nodes.length > 0 && (
                                            <Button
                                                variant="success"
                                                onClick={() => updateTopology()}
                                                disabled={isUploadingTopology || !isTopologyChanged}
                                                className="m-2 flex">
                                                {
                                                    isUploadingTopology &&
                                                    (
                                                        <Spinner size={"sm"}/>
                                                    )
                                                }
                                                {
                                                    !isUploadingTopology &&
                                                    (
                                                        <FontAwesomeIcon icon={faCircleNodes} />
                                                    )
                                                }
                                                <span className="m-1">Update topology</span>
                                            </Button>
                                        )
                                    }
                                    {
                                        isUploadingTopology && (
                                            <Button
                                                variant="danger"
                                                onClick={() => cancelUpdateTopology()}
                                                className="m-2 flex">
                                                <FontAwesomeIcon icon={faXmark} />
                                                <span className="m-1">Cancel update topology</span>
                                            </Button>
                                        )
                                    }
                                    {
                                        nodes.length > 0 && (
                                            <Button
                                                variant="primary"
                                                onClick={() => openIntentCommunication()}
                                                className="m-2 flex">
                                                <FontAwesomeIcon icon={faComments} />
                                                <span className="m-1">Input Intent</span>
                                            </Button>
                                        )
                                    }
                                    {
                                        selectedNode !== null &&
                                        selectedNode.data !== null &&
                                        Array.isArray(selectedNode.data.appliedIntents) &&
                                        selectedNode.data.appliedIntents.length > 0 &&
                                        (
                                            <Button
                                                variant="secondary"
                                                className="m-2"
                                                onClick={() => handleOpenNodeIntentHistory()}
                                            >{`Display the history of ${selectedNode.data.label}`}</Button>
                                        )
                                    }
                                </div>
                            </div>

                        </Col>
                        <Col className="h-sm-70">

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
                                showAlertHandler={showAlertHandler}
                                isOpen={isIntentCommunicationOpen}
                                handleClose={handleClose}
                                token={token}
                                setToken={setToken}
                                title="Intent Window"
                                setIntentHighlightedNodes={setIntentHighlightedNodes}
                                applyIntentToNode={applyIntentToNode}
                                isTopologyChanged={isTopologyChanged}
                            />
                            <NodeIntentsWindow
                                isOpen={isNodeIntentHistoryOpen}
                                handleClose={handleCloseNodeIntentHistory}
                                selectedNode={selectedIntentHistoryNode}
                            />
                        </Col>
                    </DndProvider>
                </Row>
            </Container>

        // </div>
    );
};

export default TopologyPage