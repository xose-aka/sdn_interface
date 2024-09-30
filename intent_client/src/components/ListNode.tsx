import React from 'react';
import {getNodeSvg} from "../helper.ts";
import {useDrag} from "react-dnd";

interface ListNodeProps {
    title: string,
}

export default function ListNode({title}: ListNodeProps) {

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
