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
import {Form} from "react-bootstrap";

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
                    {
                        isSourceIPSet ?
                            <Form.Select aria-label="Select source ip address" size="sm">
                                <option>Select source ip address</option>
                                {
                                    ipSuggestions.map((suggestedIp) => (
                                        <option key={suggestedIp} value={suggestedIp}>
                                            {suggestedIp}
                                        </option>
                                    ))
                                }
                            </Form.Select>
                            :
                            <IpInput
                                onChange={onSourceChange}
                                handleInputBlur={handleSourceInputBlur}
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
                        transform: `translate(${targetX}%, ${targetY}%) translate(${tx}px,${ty}px)`,
                        // transform: `translate(${inputCoordination2X}%, ${inputCoordination2Y}%) translate(${labelX}px,${labelY}px)`,
                        fontSize: 12,
                        // everything inside EdgeLabelRenderer has no pointer events by default
                        // if you have an interactive element, set pointer-events: all
                        pointerEvents: 'all',
                    }}
                >
                    {
                        isTargetIPSet ?
                            <Form.Select aria-label="Select target ip address" size="sm">
                                <option>Select target ip address</option>
                                {
                                    ipSuggestions.map((suggestedIp) => (
                                        <option key={suggestedIp} value={suggestedIp}>
                                            {suggestedIp}
                                        </option>
                                    ))
                                }
                            </Form.Select>
                            :
                            <IpInput
                                onChange={onTargetChange}
                                handleInputBlur={handleTargetInputBlur}
                            />
                    }
                </div>
            </EdgeLabelRenderer>
        </>
    );
}
