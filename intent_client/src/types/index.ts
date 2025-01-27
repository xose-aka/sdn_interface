
export interface Coordinates {
    x: number,
    y: number
}

export interface TopoEntityDTO {
    id: string,
    neighbours: Neighbour[],
    label: string,
    type: string
}

export interface AppliedIntentResult {
    message: string,
    conversationId: string,
    nodeId: string,
    timestamp: string
}

export interface Neighbour {
    node: string,
    connection_ip: string | null,
}

export interface UpdateTopologyResponse {
    error: number,
    data: {
        topology_interfaces: {
            inserted_ip_addresses: string[],
            nodes: string[],
            nodes_dpid: object,
            nodes_interfaces: { [key: string]: string },
            nodes_ports: object,
        },
        nodes_intents: object
    }
}

