import Graph from "./components/Graph.tsx";
import NodeList from "./components/NodeList.tsx";
import {Col, Container, Row} from "react-bootstrap";
import NodeListHeader from "./components/NodeListHeader.tsx";
import {DndProvider} from "react-dnd";
import {HTML5Backend} from "react-dnd-html5-backend";
import React, {useEffect} from "react";
import GraphWithReactFlow from "./components/GraphWithReactFlow.tsx";
import {ReactFlowProvider} from "@xyflow/react";
import '@xyflow/react/dist/style.css';
import './App.css'

function App() {

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
          <DndProvider backend={HTML5Backend}>
              <div className={'main-container'}>
                  <Container fluid={true} >
                      <Row className={'h-100'}>
                          <Col xs={2} className={'border-end bg-light'}
                               onClick={ () => resetNodeSelection() }>
                              <NodeListHeader/>
                              <NodeList
                                  nodeList={nodeList}
                                  resetNodeSelection={() => resetNodeSelection()}
                              />
                          </Col>
                          <Col xs={10}>
                              <ReactFlowProvider>
                                  <GraphWithReactFlow
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
                      </Row>
                  </Container>
              </div>
          </DndProvider>
    )
}

export default App
