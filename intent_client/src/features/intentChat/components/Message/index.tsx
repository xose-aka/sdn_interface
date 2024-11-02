import React from 'react';
import './index.scss'
import {MessageProps} from "./index.types.ts";

function Index({ message }: MessageProps)
{
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

export default Index;
