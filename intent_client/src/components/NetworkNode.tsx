import React, {useEffect, useState} from 'react';
import {Handle, Position, useConnection, useStore} from "@xyflow/react";


export default function NetworkNode({ id, data, isConnectable }) {

    const connection = useConnection();

    const isTarget = connection.inProgress && connection.fromNode.id !== id;

    const [dimensions, setDimensions] = useState({ width: 'auto', height: 'auto' });

    useEffect(() => {
        const img = new Image();
        img.src = data.icon;
        img.onload = () => {
            setDimensions({ width: img.width, height: img.height });
        };
    }, [])

    return (
        <div className={"customNode " + (data.isThisNodeClicked ? 'highlight-node' : '')}>
            <div className={'customNodeBody' }
                 style={{
                     backgroundImage: 'url(' + data.icon + ')',
                     width: `${dimensions.width}px`,
                     height: `${dimensions.height}px`,
                 }}
            >
                {/*<img src={ data.icon  } alt={data.icon}/>*/}
                {/* If handles are conditionally rendered and not present initially, you need to update the node internals https://reactflow.dev/docs/api/hooks/use-update-node-internals/ */}
                {/* In this case we don't need to use useUpdateNodeInternals, since !isConnecting is true at the beginning and all handles are rendered initially. */}
                { !connection.inProgress && (
                    /*{{ !connection.inProgress && (}*/
                    <Handle
                        className="customHandle"
                        position={Position.Right}
                        type="source"
                        isConnectable={data.isThisNodeClicked}
                    />
                )}
                {/* We want to disable the target handle, if the connection was started from this node */}
                { (!connection.inProgress || isTarget) && (
                    <Handle
                        className="customHandle" position={Position.Left}
                        type="target"
                        isConnectableStart={false} />
                )}
            </div>
            <div className='node-label'>{ data.label }</div>
        </div>
    );
}
