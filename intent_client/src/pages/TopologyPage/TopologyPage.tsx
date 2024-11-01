import {Col, Container, Row} from "react-bootstrap";
import {DndProvider} from "react-dnd";
import {HTML5Backend} from "react-dnd-html5-backend";

// import GraphWithReactFlow from "./components/GraphWithReactFlow.tsx";
import {ReactFlowProvider} from "@xyflow/react";
import React from "react";
import ListNode from "../../features/topology/components/ListNodeSidebar/ListNode.tsx";
import TopoBuild from "../../features/topology/components/TopoBuild/TopoBuild.tsx";


const TopologyPage: React.FC = () => {

    const nodeList = ["router", "switch", "server"]

    const [selectedNode, setSelectedNode] = React.useState<object>({})
    const [selectedEdge, setSelectedEdge] = React.useState<string>('')
    const [selections, setSelections] = React.useState<string[]>([])

    const resetNodeSelection = () => {
        setSelectedNode({})
        setSelectedEdge('')
        setSelections([])
    }

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
                            <ReactFlowProvider>
                                <TopoBuild
                                    nodeList={nodeList}
                                    setSelectedNode={setSelectedNode}
                                    setSelections={setSelections}
                                    selectedNode={selectedNode}
                                    selections={selections}
                                    selectedEdge={selectedEdge}
                                    setSelectedEdge={setSelectedEdge}
                                    resetNodeSelection={resetNodeSelection}
                                />
                            </ReactFlowProvider>
                        </Col>
                    </DndProvider>
                </Row>
            </Container>
        </div>
    );
};

export default TopologyPage