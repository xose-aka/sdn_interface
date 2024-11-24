import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
    faCheckDouble,
    faCircleExclamation,
    faSpinner
} from "@fortawesome/free-solid-svg-icons";
import React from "react";
import {MessageStatusProps} from "./index.types.ts";
import './index.scss'
import {Statuses} from "../../constants/intentMessage.ts";
import {pending, sent} from "../../../../constants/intentMessage.ts";

export default function Index({ status }: MessageStatusProps) {

    let intentMessageDeliverStatus = ''
    let intentMessageDeliverStatusIcon = faCircleExclamation

    if (status === Statuses["PENDING"]) {
        intentMessageDeliverStatus = pending
        intentMessageDeliverStatusIcon = faSpinner
    } else if (status === Statuses["SENT"]) {
        intentMessageDeliverStatus = sent
        intentMessageDeliverStatusIcon = faCheckDouble
    }

    return (
        <div className="chat-message__item__deliver-status">
            <div className="chat-message__item__deliver-status__items">
                <div className="me-1">{intentMessageDeliverStatus}</div>
                <FontAwesomeIcon icon={intentMessageDeliverStatusIcon}/>
            </div>
        </div>
    )
}