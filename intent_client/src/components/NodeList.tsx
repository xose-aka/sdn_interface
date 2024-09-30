import {ListGroup} from "react-bootstrap";
import React from "react";
import Node from "./ListNode.tsx";

interface NodeListProps {
    nodeList: string[],
    resetNodeSelection: () => void
}

function NodeList({nodeList, resetNodeSelection}: NodeListProps) {

    return (
        <ListGroup variant={'flush'}>
            {
                nodeList.map(
                    (node) => {

                        return (
                                    <ListGroup.Item key={node} className='bg-light text-center my-3'>
                                            <Node
                                                title={node}
                                                resetNodeSelection={ () => resetNodeSelection()}
                                            />
                                    </ListGroup.Item>

                        )
                    }
               )
            }
        </ListGroup>
    )
}

export default NodeList