import React from 'react';
import {useDrag} from "react-dnd";
import {getNodeSvg} from "../../../../utils/node.ts";

function NodeList({type}: ListNodeProps) {

    const nodeSvg = getNodeSvg(type)

    const [, drag] = useDrag(() => ({
        type,
        item: { type }
    }))

    return (
        <div ref={drag}>
            <img src={ nodeSvg } alt={type}/>
        </div>
    );
}

export default NodeList
