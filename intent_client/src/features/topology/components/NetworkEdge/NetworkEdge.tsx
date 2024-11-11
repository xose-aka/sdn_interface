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
import IpInput from "../IpInput/IpInput.tsx";

export default function CustomEdge({
                                       id,
                                       source,
                                       target,
                                       style = {},
                                       markerEnd,
                                   }: EdgeProps) {
    const { setEdges } = useReactFlow();

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

    let targetX = -5

    let targetY = -260
    let sourceY = -130

    if (sy > ty) {
        targetY = -targetY -200
    } else {
        sourceY = -sourceY
    }

    // let inputCoordination2Y = labelY
    let inputCoordination2Y = 650 + labelY
    // let inputCoordination2X = labelX - 410
    let inputCoordination2X = 410 - labelX
    // let inputCoordination2X = labelX

    return (
        <>
            <BaseEdge
                path={edgePath}
                      markerEnd={markerEnd} style={style} />

            <EdgeLabelRenderer>
                <div
                    style={{
                        // position: 'absolute',
                        transform: `translate(-5%, ${sourceY}%) translate(${sx}px,${sy}px)`,
                        fontSize: 12,
                        // everything inside EdgeLabelRenderer has no pointer events by default
                        // if you have an interactive element, set pointer-events: all
                        pointerEvents: 'all',
                    }}
                >
                    {/*<input*/}
                    {/*    type="text"*/}
                    {/*    minLength={7}*/}
                    {/*    maxLength={15}*/}
                    {/*    size={15}*/}
                    {/*    pattern="^(?>(\d|[1-9]\d{2}|1\d\d|2[0-4]\d|25[0-5])\.){3}(?1)$"*/}
                    {/*/>*/}
                    <IpInput/>
                </div>

                <div
                    style={{
                        position: 'absolute',
                        transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                        // transform: `translate(${labelX}px,${labelY}px)`,
                        fontSize: 12,
                        // everything inside EdgeLabelRenderer has no pointer events by default
                        // if you have an interactive element, set pointer-events: all
                        pointerEvents: 'all',
                    }}
                    className="nodrag nopan"
                >

                    <button className="edgebutton" onClick={onEdgeClick}>
                        ×
                    </button>
                </div>
                <div
                    style={{
                        // position: 'absolute',
                        transform: `translate(${targetX}%, ${targetY}%) translate(${tx}px,${ty}px)`,
                        // transform: `translate(${inputCoordination2X}%, ${inputCoordination2Y}%) translate(${labelX}px,${labelY}px)`,
                        fontSize: 12,
                        // everything inside EdgeLabelRenderer has no pointer events by default
                        // if you have an interactive element, set pointer-events: all
                        pointerEvents: 'all',
                    }}
                >
                    {/*<input*/}
                    {/*    type="text"*/}
                    {/*    minLength={7}*/}
                    {/*    maxLength={15}*/}
                    {/*    size={15}*/}
                    {/*    pattern="^(?>(\d|[1-9]\d{2}|1\d\d|2[0-4]\d|25[0-5])\.){3}(?1)$"*/}
                    {/*/>*/}
                    <IpInput/>

                </div>
            </EdgeLabelRenderer>
        </>
    );
}
