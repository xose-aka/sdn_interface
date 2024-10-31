import React from 'react';
import '../styles/chat-message.scss'
import {IntentMessage} from "../constants/types.ts";

type ChatMessageProps = {
    message: IntentMessage
}

function ChatConversation({
                         message,
}: ChatMessageProps) {



    return (
        <div
            className={`chat-message ${message.sender == 'user' ? 'is-same-origin' : ''}`}
        >
            <div className="chat-message__item__timestamp">{message.timestamp.toString()}</div>
            <div className="chat-message__item">
                <span className="chat-message__item__text">{message.message}</span>
            </div>
        </div>
    );
}

export default ChatConversation;
