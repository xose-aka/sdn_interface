import React, { useState } from 'react';
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
import './index.css'

export default function CustomEdge({
                                       id,
                                       source,
                                       target,
                                       style = {},
                                       data,
                                       markerEnd,
                                   }: EdgeProps) {
    const { setEdges } = useReactFlow();

    const onEdgeClick = () => {
        setEdges((edges) => edges.filter((edge) => edge.id !== id));
    };

    const onEdgeSourceIpSet = (ip: string) => {
        setEdges((edges) => edges.map((edge) => {
            edge.sourceHandle = ip
            return edge;
        } ));
    };

    const onEdgeTargetIpSet = (ip: string) => {
        setEdges((edges) => edges.map((edge) => {
            edge.targetHandle = ip
            return edge;
        } ));
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

    const [sourceIp, setSourceIp] = useState<string>("")
    const [tmp, setTmp] = useState<string>("")

    let targetX = -5
    let sourceX = -5

    let targetY = -260
    let sourceY = -130

    if (sy > ty) {
        targetY = -targetY - 200
        sourceY = sourceY - 200
    } else {
        sourceY = -sourceY
    }

    const differenceY = Math.abs(sy) - Math.abs(ty)

    if ( differenceY < 350 ) {
        if (sx < tx) {
            sourceX = -sourceX - 4
        } else {
            targetX = -targetX - 4
        }
    }

    if (sx > tx) {
        sourceX = sourceX - 13
    } else {
        targetX = targetX - 13
    }

    function isValidIPv4(ip: string) {
        // Regular expression for a valid IPv4 address
        const ipv4Regex = /^(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}$/;

        return ipv4Regex.test(ip);
    }

    const onSourceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;  // TypeScript knows this is a string
        setTmp(value)
    }

    const handleSourceInputBlur = () => {
        const ipWithoutUnderline = tmp.replace(/_/g, "")
        if (isValidIPv4(ipWithoutUnderline)) {
            onEdgeSourceIpSet(ipWithoutUnderline)
        }
    };

    const onTargetChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;  // TypeScript knows this is a string
        setTmp(value)
    }

    const handleTargetInputBlur = () => {
        const ipWithoutUnderline = tmp.replace(/_/g, "")
        if (isValidIPv4(ipWithoutUnderline)) {
            onEdgeTargetIpSet(ipWithoutUnderline)
        }
    };

    return (
        <>
            <BaseEdge
                path={edgePath}
                      markerEnd={markerEnd} style={style} />
            <EdgeLabelRenderer>
                <div
                    style={{
                        position: 'absolute',
                        transform: `translate(${sourceX}%, ${sourceY}%) translate(${sx}px,${sy}px)`,
                        fontSize: 12,
                        // everything inside EdgeLabelRenderer has no pointer events by default
                        // if you have an interactive element, set pointer-events: all
                        pointerEvents: 'all',
                    }}
                >
                    <IpInput
                        onChange={onSourceChange}
                        handleInputBlur={handleSourceInputBlur}
                    />
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
                        transform: `translate(${targetX}%, ${targetY}%) translate(${tx}px,${ty}px)`,
                        // transform: `translate(${inputCoordination2X}%, ${inputCoordination2Y}%) translate(${labelX}px,${labelY}px)`,
                        fontSize: 12,
                        // everything inside EdgeLabelRenderer has no pointer events by default
                        // if you have an interactive element, set pointer-events: all
                        pointerEvents: 'all',
                    }}
                >
                    <IpInput
                        onChange={onTargetChange}
                        handleInputBlur={handleTargetInputBlur}
                    />
                </div>
            </EdgeLabelRenderer>
        </>
    );
}
