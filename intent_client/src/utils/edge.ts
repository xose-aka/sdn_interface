import {InternalNode, Position} from "@xyflow/react";
import {getNodeIntersection} from "./node.ts";
import {Coordinates} from "../types";

function getEdgePosition(node: InternalNode, intersectionPoint: Coordinates) {
    const n = { ...node.internals.positionAbsolute, ...node };
    const nx = Math.round(n.x);
    const ny = Math.round(n.y);
    const px = Math.round(intersectionPoint.x);
    const py = Math.round(intersectionPoint.y);

    let nWidth = 0, nHeight = 0;

    if (n.measured.width)
        nWidth = n.measured.width

    if (n.measured.height)
        nHeight = n.measured.height

    if (px <= nx + 1) {
        return Position.Left;
    }

    if (px >= nx + nWidth - 1) {
        return Position.Right;
    }
    if (py <= ny + 1) {
        return Position.Top;
    }
    if (py >= n.y + nHeight - 1) {
        return Position.Bottom;
    }

    return Position.Top;
}

function getEdgeParams(source: InternalNode, target: InternalNode) {
    const sourceIntersectionPoint = getNodeIntersection(source, target);
    const targetIntersectionPoint = getNodeIntersection(target, source);

    const sourcePos = getEdgePosition(source, sourceIntersectionPoint);
    const targetPos = getEdgePosition(target, targetIntersectionPoint);

    return {
        sx: sourceIntersectionPoint.x,
        sy: sourceIntersectionPoint.y,
        tx: targetIntersectionPoint.x,
        ty: targetIntersectionPoint.y,
        sourcePos,
        targetPos,
    };
}

export {getEdgePosition, getEdgeParams}
