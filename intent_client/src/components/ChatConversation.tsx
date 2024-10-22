import React from 'react';
import '../styles/chat-message.scss'

type ChatMessageProps = {
    dateTimeStamp: string
    message: string
    isSameOrigin: boolean
}

function ChatConversation({
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

export default ChatConversation;
