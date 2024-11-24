import React from 'react';
import './index.scss'
import Confirmation from '../Confirmation'
import MessageStatus from '../MessageStatus'
import {MessageProps} from "./index.types.ts";
import {SenderTypes, Statuses} from "../../constants/intentMessage.ts";

function Index({ message, submitConfirmMessage }: MessageProps)
{
    return (
        <div className={`chat-message ${message.sender == SenderTypes["USER"] ? 'is-same-origin' : ''}`}>
            <div className="chat-message__item__timestamp">{message.timestamp.toString()}</div>
            <div className="chat-message__item">
                {
                    message.sender == SenderTypes["USER"] &&
                    (
                        <MessageStatus status={message.status}></MessageStatus>
                    )
                }
                <span className="chat-message__item__text">
                    <span className={ message.sender === SenderTypes["SERVER"] &&
                                      message.status === Statuses["PENDING"] ? "chat-message__loading": "" }>
                        {message.text}
                    </span>
                </span>
            </div>
            {
                message.sender == SenderTypes["SERVER"] &&
                message.status == Statuses["RECEIVED"] &&
                message.isConfirmationDone === false &&
                (
                    <Confirmation submitConfirmMessage={submitConfirmMessage}>Is it correct ?</Confirmation>
                )
            }
        </div>
    );
}

export default Index;
