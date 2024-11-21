import routerSvg from "../assets/router.png";
import switchSvg from "../assets/switch.png";
import serverSvg from "../assets/server.jpg";
import {InternalNode} from "@xyflow/react";
import {nodeTypes} from "../constants/topology.ts";

function getNodeSvg(type: string) {
    if ( type === nodeTypes["ROUTER"] )
        return  routerSvg
    else if ( type === nodeTypes["SWITCH"] )
        return switchSvg
    else if ( type === nodeTypes["HOST"] )
        return serverSvg
    else
        return ''
}

function getNodeIntersection(intersectionNode: InternalNode, targetNode: InternalNode) {
    // https://math.stackexchange.com/questions/1724792/an-algorithm-for-finding-the-intersection-point-between-a-center-of-vision-and-a
    const { width: intersectionNodeWidth, height: intersectionNodeHeight } =
        intersectionNode.measured;
    const intersectionNodePosition = intersectionNode.internals.positionAbsolute;
    const targetPosition = targetNode.internals.positionAbsolute;

    let w = 0, h = 0

    if (intersectionNodeWidth)
        w = intersectionNodeWidth / 2;


    if (intersectionNodeHeight)
        h = intersectionNodeHeight / 2;

    // target node
    const { width: targetNodeWidth, height: targetNodeHeight } =
        targetNode.measured;

    const x2 = intersectionNodePosition.x + w;
    const y2 = intersectionNodePosition.y + h;

    let x1 = 0, y1 = 0;


    if (targetNodeWidth)
        x1 = targetPosition.x + targetNodeWidth / 2;

    if (targetNodeHeight)
        y1 = targetPosition.y + targetNodeHeight / 2;

    const xx1 = (x1 - x2) / (2 * w) - (y1 - y2) / (2 * h);
    const yy1 = (x1 - x2) / (2 * w) + (y1 - y2) / (2 * h);
    const a = 1 / (Math.abs(xx1) + Math.abs(yy1) || 1);
    const xx3 = a * xx1;
    const yy3 = a * yy1;
    const x = w * (xx3 + yy3) + x2;
    const y = h * (-xx3 + yy3) + y2;

    return { x, y };
}

export {getNodeSvg, getNodeIntersection}
