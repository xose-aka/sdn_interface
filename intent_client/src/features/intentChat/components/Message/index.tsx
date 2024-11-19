import React from 'react';
import './index.scss'
import {MessageProps} from "./index.types.ts";
import {Col, Row} from "react-bootstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
    faCheckDouble,
    faCircleCheck,
    faCircleExclamation,
    faRectangleXmark,
    faSpinner
} from "@fortawesome/free-solid-svg-icons";
import {pending, sent} from "../../../../constants/intentMessage.ts";
import {SenderTypes} from "../../constants/intentMessage.ts";

function Index({ message, pendingMessage, submitConfirmMessage }: MessageProps)
{

    let intentMessageDeliverStatus = ''
    let intentMessageDeliverStatusIcon = faCircleExclamation

    if (message.status === "pending") {
        intentMessageDeliverStatus = pending
        intentMessageDeliverStatusIcon = faSpinner
    } else if (message.status === "sent") {
        intentMessageDeliverStatus = sent
        intentMessageDeliverStatusIcon = faCheckDouble
    }

    return (
        <div
            className={`chat-message ${message.sender == 'user' ? 'is-same-origin' : ''}`}
        >
            <div className="chat-message__item__timestamp">{message.timestamp.toString()}</div>
            <div className="chat-message__item">
                {
                    message.sender == 'user' &&
                    (
                        <div className="chat-message__item__text__deliver-status">
                            <div className="chat-message__item__text__deliver-status__items">
                                <div className="me-1">{intentMessageDeliverStatus}</div>
                                <FontAwesomeIcon icon={intentMessageDeliverStatusIcon}/>
                            </div>
                        </div>
                    )
                }
                <span className="chat-message__item__text">
                    <span className={ message.sender === "server" && message.status === "pending" ? "chat-message__loading": "" }>
                        {message.text}
                    </span>
                </span>
            </div>
            {
                message.sender == SenderTypes["SERVER"] &&
                message.isConfirmationDone === false &&
                (
                    <div className="chat-message__item__text__confirmation bg-light border text-center mt-1">
                        <div className="mt-1">Do you confirm it ?</div>
                        <hr className="m-1"/>
                        <Row className="fs-6">
                            <Col>
                                <FontAwesomeIcon className="text-success cursor-pointer"
                                                 icon={faCircleCheck}
                                                 onClick={() => submitConfirmMessage(true)}/>
                            </Col>
                            <Col>
                                <FontAwesomeIcon className="text-danger cursor-pointer"
                                                 icon={faRectangleXmark}
                                                 onClick={() => submitConfirmMessage(false)}/>
                            </Col>
                        </Row>
                    </div>
                )
            }
        </div>
    );
}

export default Index;
