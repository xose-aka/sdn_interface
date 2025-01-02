import React from 'react';
import {Handle, Position, useConnection, NodeProps} from "@xyflow/react";
import "./index.css"



export default function NetworkNode({ id, data }: NodeProps) {

    const connection = useConnection();

    const isTarget = connection.inProgress && connection.fromNode.id !== id;

    let isThisNodeClicked = data.isThisNodeClicked as boolean
    let label = data.label as string

    const appliedIntents: string[] = data.appliedIntetns as string[]

    console.log("appliedIntents", appliedIntents)


    const img: HTMLImageElement = new Image();
    img.src = data.icon as string;

    return (
        <div className={"customNode  " + (data.isThisNodeClicked ? 'highlight-node' : '')}>

            <div className='custom-node-body'
                 style={{
                     backgroundImage: 'url(' + data.icon + ')',
                     width: `${img.width}px`,
                     height: `${img.height}px`,
                 }}
            >
                { appliedIntents !== undefined &&
                    (
                        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                            { appliedIntents.length }
                        </span>
                    )
                }

                {/* If handles are conditionally rendered and not present initially, you need to update the node internals https://reactflow.dev/docs/api/hooks/use-update-node-internals/ */}
                {/* In this case we don't need to use useUpdateNodeInternals, since !isConnecting is true at the beginning and all handles are rendered initially. */}
                { !connection.inProgress && (
                    <Handle
                        className="customHandle"
                        position={Position.Right}
                        type="source"
                        isConnectable={isThisNodeClicked}
                        id={`handle-source-${id}`}
                    />
                )}
                {/* We want to disable the target handle, if the connection was started from this node */}
                { (!connection.inProgress || isTarget) && (
                    <Handle
                        className="customHandle"
                        position={Position.Left}
                        type="target"
                        isConnectableStart={false}
                        id={`handle-target-${id}`}
                    />
                )}
            </div>
            <div className='node-label'>{ label }</div>
        </div>
    );
}
