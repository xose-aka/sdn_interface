import React from 'react';
import {useDrag} from "react-dnd";
import {getNodeSvg} from "../../../../utils/node.ts";

function NodeList({title}: ListNodeProps) {

    const nodeSvg = getNodeSvg(title)

    const type = title

    const [, drag] = useDrag(() => ({
        type,
        item: { title }
    }))

    return (
        <div ref={drag}>
            <img src={ nodeSvg  } alt={title}/>
        </div>
    );
}

export default NodeList
