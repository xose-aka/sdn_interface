import React from 'react';
import {
    BaseEdge,
    EdgeLabelRenderer,
    EdgeProps,
    useReactFlow,
    getStraightPath,
    useInternalNode
} from '@xyflow/react';

import { getEdgeParams } from '../../../../utils/edge.ts';
import './index.css'
import IpSetButton from "../SetIPButton";
import {NodeTypes} from "../../constants.ts";
import {useModal} from "../SetIPModalProvider/useModal.ts";

export default function CustomEdge({
                                       id,
                                       source,
                                       target,
                                       style = {},
                                       data,
                                       markerEnd,
                                   }: EdgeProps) {
    const { setEdges } = useReactFlow();

    const { showModal } = useModal();

    const onEdgeClick = () => {
        setEdges((edges) => edges.filter((edge) => edge.id !== id));
    };

    const sourceNode = useInternalNode(source);
    const targetNode = useInternalNode(target);

    if (!sourceNode || !targetNode) {
        return null;
    }

    const { sx, sy, tx, ty } = getEdgeParams(sourceNode, targetNode);

    const [edgePath, labelX, labelY] = getStraightPath({
        sourceX: sx,
        sourceY: sy,
        targetX: tx,
        targetY: ty,
    });

    let targetX = -50
    let targetY = -180

    let sourceY = 75
    let sourceX = -50

    if (sy < ty) {
        targetY = -targetY - 100
        sourceY = -sourceY - 100
    } else {
        // sourceY = -sourceY
    }

    const differenceY = Math.abs(sy) - Math.abs(ty)


    if ( differenceY < 70 ) {
        // targetX += ( 70 - differenceY )
        // targetY -= (90)


        if (sx < tx) {
            // sourceX = -sourceX - 4
        } else {
            // targetX = -targetX - 4
        }
    }

    const labelSource = sourceNode.data.label as string
    const labelTarget = targetNode.data.label as string
    const targetIP = data!.sourceIPAddress as string
    const sourceIP = data!.targetIPAddress as string

    return (
        <>
            <BaseEdge
                path={edgePath}
                      markerEnd={markerEnd} style={style} />
            <circle r="10" fill="#ff0073">
                <animateMotion dur="2s" repeatCount="indefinite" path={edgePath} />
            </circle>
            <EdgeLabelRenderer>
                <div
                    style={{
                        position: 'absolute',
                        transform: `translate(${sourceX}%, ${sourceY}%) translate(${labelX}px,${labelY}px)`,
                        fontSize: 12,
                        // everything inside EdgeLabelRenderer has no pointer events by default
                        // if you have an interactive element, set pointer-events: all
                        pointerEvents: 'all',
                    }}
                >
                    {
                        <IpSetButton
                            ipAddress={sourceIP}
                            label={labelSource}
                            showModal={ () => showModal(labelSource, NodeTypes["SOURCE"]) }
                        />
                    }
                </div>
                <div
                    style={{
                        transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                        fontSize: 12,
                        // everything inside EdgeLabelRenderer has no pointer events by default
                        // if you have an interactive element, set pointer-events: all
                    }}
                    className="button-edge__label nodrag nopan"
                >

                    <button className="edgebutton" onClick={onEdgeClick}>
                        ×
                    </button>

                </div>
                <div
                    style={{
                        position: 'absolute',
                        transform: `translate(${targetX}%, ${targetY}%) translate(${labelX}px,${labelY}px)`,
                        fontSize: 12,
                        // everything inside EdgeLabelRenderer has no pointer events by default
                        // if you have an interactive element, set pointer-events: all
                        pointerEvents: 'all',
                    }}
                >
                    {
                        <IpSetButton
                            ipAddress={targetIP}
                            label={labelTarget}
                            showModal={ () => showModal(labelTarget, NodeTypes["TARGET"]) }
                        />
                    }
                </div>
            </EdgeLabelRenderer>
        </>
    );
}
