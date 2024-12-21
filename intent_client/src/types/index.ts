
interface Coordinates {
    x: number,
    y: number
}

export interface TopoEntityDTO {
    id: string,
    neighbours: Neighbour[],
    type: string
}

export interface Neighbour {
    node: string,
    connection_ip: string | null,
}

