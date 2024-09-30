import React, {ChangeEvent, useEffect, useRef, useState} from "react";
import {GraphCanvas, GraphCanvasRef, GraphNode, Svg, GraphEdge, InternalGraphEdge} from "reagraph";
import {useDrop} from "react-dnd";
import {getNodeSvg, isObjectEmpty} from "../helper.ts";
import {Button, Card, Form} from "react-bootstrap";

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
export default function Graph(
    {
        nodeList,
        setSelectedNode,
        setSelections,
        selectedNode,
        selectedEdge,
        selections,
        resetNodeSelection,
        setSelectedEdge
    }: GraphProps) {

    const [nodeCounter, setNodeCounter] = useState(1)

    const [nodes, setNodes] = React.useState<GraphNode[]>([])

    const [selectedTargetNode, setSelectedTargetNode] = React.useState<string>('')

    const [edges, setEdges] = React.useState<GraphEdge[]>(
        [
            // {
            //     id: '1->2',
            //     source: 'n-1',
            //     target: 'n-2',
            //     label: 'Edge 1-2'
            // }
        ]
    )

    const nodeRef = useRef(new Map());

    const graphRef = useRef<GraphCanvasRef | null>(null);

    const [, drop] = useDrop(
        () => ({
                    accept: nodeList,
                    drop: (item) => {
                        const icon = getNodeSvg(item.title)

                        const newNode = {
                            id: `n-${nodeCounter}`,
                            label: `${nodeCounter}`,
                            icon: icon,
                            size: 25
                        }

                        setNodes([...nodes, newNode])
                        setNodeCounter(nodeCounter + 1)
                    }
                }),
        [nodes]
    )

    const onEdgeNodeSelected = (event: ChangeEvent<HTMLSelectElement>) => {
        setSelectedTargetNode(event.target.value);
    };

    const onNodeClicked = (node: GraphNode) => {
        resetNodeSelection()
        setSelections([node.id])
        setSelectedNode(node)
    };

    const onCanvasClick = (event: MouseEvent) => {
        resetNodeSelection()
    };

    const onTargetNodeSelectSubmit = () => {

        if ( selectedTargetNode !== '' && !isObjectEmpty(selectedNode) ) {

            const newEdgeId = selectedTargetNode + "->" + selectedNode.id
            const newEdgeSource = selectedNode.id
            const newEdgeTarget = selectedTargetNode
            const newEdgeLabel = selectedNode.id + " to " + selectedTargetNode

            const newEdge =
                {
                    id: newEdgeId,
                    source: newEdgeSource,
                    target: newEdgeTarget,
                    label: newEdgeLabel
                }

                setEdges([...edges, newEdge])
        }

    };

    const onEdgeClick = (edge: InternalGraphEdge) => {
        resetNodeSelection()
        setSelectedEdge(edge.id)
    };

    const handleDeleteKeyPress = (event: KeyboardEvent) => {
        if (event.key === 'Delete') {
            console.log(selectedNode, selectedEdge);

            if ( !isObjectEmpty(selectedNode) )
            {
                const newEdges = edges.filter(edge => !edge.id.includes(selectedNode.id))
                setEdges(newEdges)

                const newNodes = nodes.filter(node => node.id !== selectedNode.id)
                setNodes(newNodes)
            }

            if (selectedEdge !== '') {
                const newEdges = edges.filter(edge => !edge.id.includes(selectedEdge))
                setEdges(newEdges)
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

    const buildTopology = () => {

        let topologyNodes = []

        console.log(nodes);

        // nodes.forEach(node => {
        //
        //     let type = ''
        //
        //     if (node.icon.includes('router') )
        //         type = 'router'
        //     if (node.icon.includes('switch') )
        //         type = 'switch'
        //     if (node.icon.includes('server') )
        //         type = 'host'
        //
        //     const neighbours = edges.filter(edge => {
        //         return edge.source === node.id || edge.target === node.id;
        //
        //     })
        //         .map(edge => {
        //         if (edge.source === node.id)
        //             return edge.target
        //
        //         if (edge.target === node.id)
        //             return edge.source
        //     })
        //
        //     const newTopologyNode = {
        //         type: type,
        //         id: node.id,
        //         neighbors: neighbours
        //     }
        //
        //     topologyNodes.push(newTopologyNode)

        // })

        console.log(topologyNodes)

    }


    return (
        <div className={'graph-container'}
             ref={drop}
             style={
                 {
                     position: "relative"
                 }
             }
        >
            <Card
                style={
                    {
                        display: isObjectEmpty(selectedNode) ? "none" : "",
                        position: "absolute",
                        zIndex: 1000
                    }
                }>
                <Card.Header>Edge between nodes</Card.Header>
                <Card.Body>
                    <Card.Title>Select node to connect</Card.Title>
                    <Card.Text>
                        <Form.Select onChange={onEdgeNodeSelected} defaultValue={""}>
                            <option value="" disabled>
                                Select a target node
                            </option>
                            {
                                nodes.filter(node => {
                                    return !(!isObjectEmpty(selectedNode) && node.id === selectedNode.id);
                                }).map(node =>
                                    (
                                        <option
                                                key={node.id}
                                                value={node.id}>{node.label}
                                        </option>
                                    )
                                )
                            }
                        </Form.Select>
                    </Card.Text>
                </Card.Body>
                <Card.Footer>
                    <Button variant="primary" onClick={() => onTargetNodeSelectSubmit() }>Connect</Button>
                </Card.Footer>
            </Card>

            <Button
                style={
                    {
                        position: "relative",
                        float: "right",
                        zIndex: 1000
                    }
                }
                variant="primary" onClick={() => buildTopology() }>Build</Button>

            <GraphCanvas
                draggable
                edgeArrowPosition="none"

                layoutOverrides={{
                    getNodePosition: id => {
                        return nodeRef.current.get(id)?.position;
                    }
                }}
                onNodeDragged={node => {
                    // console.log('node dragged', node);
                    nodeRef.current.set(node.id, node);
                }}


                renderNode={
                    (
                        {
                            node,
                            ...rest
                        }
                    ) => {
                        return <Svg {...rest} node={node} image={node.icon || ''} />
                    }
                }

                ref={graphRef}
                selections={selections}
                onCanvasClick={onCanvasClick}
                onNodeClick={onNodeClicked}

                onEdgeClick={onEdgeClick}

                nodes={nodes}
                edges={edges}
            />
        </div>
    );
}