import { Nav } from "react-bootstrap";
import React from "react";
import NodeList from "../NodeList/NodeList.tsx";


function ListNode({nodeList}: NodeListProps) {

    return (
        <div className="text-center">
            <h3 className={'mt-3'}>Node list</h3>
            <hr/>
            <Nav variant={'pills'} className="flex-md-column flex-row flex-nowrap justify-content-around" as={"ul"}>
                {
                    nodeList.map(
                        (node) => {
                            return (
                                <Nav.Item as={"li"} key={node} className="my-md-4 my-sm-0 cursor-pointer">
                                    <NodeList type={node} />
                                </Nav.Item>
                            )
                        }
                    )
                }
            </Nav>
        </div>
    )
}

export default ListNode