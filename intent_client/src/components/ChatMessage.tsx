import React, {useEffect, useRef, useState} from 'react';
import {IntentMessage} from "../types.ts";

type ChatMessageProps = {
    dateTimeStamp: string
    message: string
    isSameOrigin: string
}

function ChatMessage({
                         dateTimeStamp,
                         message,
                         isSameOrigin
}: ChatMessageProps) {



    return (
        <div
            className={`chat-message ${isSameOrigin ? 'is-same-origin' : ''}`}
        >
            <div className="chat-message__item__timestamp">{dateTimeStamp}</div>
            <div className="chat-message__item">
                <span className="chat-message__item__text">{message}</span>
            </div>
        </div>
    );
}

export default ChatMessage;
