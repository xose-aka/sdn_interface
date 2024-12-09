import React, {useEffect, useState} from 'react';
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
import {getIPSuggestions, isValidIPv4} from "../../../../utils/helper.ts";
import {Badge, Button} from "react-bootstrap";
import IpSetButton from "../IpSetButton";

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

    let sourceY = 35
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

    const [isSourceIPSet, setIsSourceIPSet] = useState(false)
    const [isTargetIPSet, setIsTargetIPSet] = useState(false)
    const [ipSuggestions, setIpSuggestions] = useState<string[]>([])

    const [inputIP, setInputIP] = useState<string>("")

    const onEdgeSourceIpSet = (ip: string) => {
        setEdges((edges) => edges.map((edge) => {
            edge.data!.sourceIPAddress = ip
            return edge;
        } ));

        setIsTargetIPSet(true)
    };

    const onEdgeTargetIpSet = (ip: string) => {
        setEdges((edges) => edges.map((edge) => {
            edge.data!.targetIPAddress = ip
            return edge;
        } ));

        setIsSourceIPSet(true)
    };

    const onSourceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;  // TypeScript knows this is a string
        setInputIP(value)
    }

    const handleSourceInputBlur = () => {
        const ipWithoutUnderline = inputIP.replace(/_/g, "")
        if (isValidIPv4(ipWithoutUnderline)) {
            onEdgeSourceIpSet(ipWithoutUnderline)
        }
    };

    const onTargetChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;  // TypeScript knows this is a string
        setInputIP(value)
    }

    const handleTargetInputBlur = () => {
        const ipWithoutUnderline = inputIP.replace(/_/g, "")
        if (isValidIPv4(ipWithoutUnderline)) {
            onEdgeTargetIpSet(ipWithoutUnderline)
        }
    };

    useEffect(() => {
        if (isSourceIPSet || isTargetIPSet) {
            setIpSuggestions(getIPSuggestions(inputIP))
        }
    }, [isSourceIPSet, isTargetIPSet]);

    const labelSource = sourceNode.data.label as string
    const labelTarget = targetNode.data.label as string

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

                            label={labelSource}
                        />
                        // <IpInput
                        //     onChange={onSourceChange}
                        //     handleInputBlur={handleSourceInputBlur}
                        //     type={"source"}
                        //     isIPSet={isSourceIPSet}
                        //     ipSuggestions={ipSuggestions}
                        //     label={labelSource}
                        // />
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
                        <IpInput
                            onChange={onTargetChange}
                            handleInputBlur={handleTargetInputBlur}
                            type={"target"}
                            isIPSet={isTargetIPSet}
                            ipSuggestions={ipSuggestions}
                            label={labelTarget}
                        />
                    }
                </div>
            </EdgeLabelRenderer>
        </>
    );
}
