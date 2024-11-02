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

    return (
        <>
            <BaseEdge
                path={edgePath}
                      markerEnd={markerEnd} style={style} />
            <EdgeLabelRenderer>
                <div
                    style={{
                        position: 'absolute',
                        transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
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
            </EdgeLabelRenderer>
        </>
    );
}
