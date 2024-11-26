import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
    faCheckDouble,
    faCircleExclamation, faCircleQuestion,
    faSpinner
} from "@fortawesome/free-solid-svg-icons";
import React from "react";
import {MessageStatusProps} from "./index.types.ts";
import './index.scss'
import {Statuses} from "../../constants/intentMessage.ts";
import {error, pending, sent} from "../../../../constants/intentMessage.ts";

export default function Index({ status }: MessageStatusProps) {

    let intentMessageDeliverStatus = ''
    let intentMessageDeliverStatusIcon = faCircleQuestion

    if (status === Statuses["PENDING"]) {
        intentMessageDeliverStatus = pending
        intentMessageDeliverStatusIcon = faSpinner
    } else if (status === Statuses["SENT"]) {
        intentMessageDeliverStatus = sent
        intentMessageDeliverStatusIcon = faCheckDouble
    } else if (status === Statuses["ERROR"]) {
        intentMessageDeliverStatus = error
        intentMessageDeliverStatusIcon = faCircleExclamation
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