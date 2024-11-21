import {Col, ListGroup, Row} from "react-bootstrap";
import React from "react";
import NodeList from "../NodeList/NodeList.tsx";


function ListNode({nodeList, resetNodeSelection}: NodeListProps) {

    return (
        <Row>
            <Col>
                <h3 className={'text-center'}>Node list</h3>
                <ListGroup variant={'flush'}>
                    {
                        nodeList.map(
                            (node) => {
                                return (
                                    <ListGroup.Item key={node} className='bg-light text-center my-3'>
                                        <NodeList type={node} />
                                    </ListGroup.Item>
                                )
                            }
                        )
                    }
                </ListGroup>
            </Col>
        </Row>
    )
}

export default ListNode