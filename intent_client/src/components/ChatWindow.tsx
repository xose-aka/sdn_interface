import React, {useEffect, useRef, useState} from 'react';
import {IntentMessage} from "../types.ts";
import ChatMessage from "./ChatMessage.tsx";
import {createFocusTrap, FocusTrap} from "focus-trap";
import '../styles/chat-window.scss'

type ChatWindowProps = {
    isOpen: boolean,
    messages: IntentMessage[]
    onClose: () => void,
    onMessageSent: ( message : string) => void,
    title: string
}

function ChatWindow({
                        isOpen,
                        messages,
                        onClose,
                        onMessageSent,
                        title
}: ChatWindowProps) {

    const chatWindow = useRef<HTMLDivElement | null>(null);
    const chatWindowBody = useRef<HTMLDivElement | null>(null);
    const userInput = useRef();

    const [message, setValue] = useState("");
    const [focusTrap, setFocusTrap] = useState<FocusTrap | null>(null);
    const [ipAddress, setIpAddress] = useState(null);

    // const [position, setPosition] = useState({ x: 0, y: 0 });
    // const [size, setSize] = useState({ width: 500, height: 300 });
    // const [isDragging, setIsDragging] = useState(false);
    // const [isResizing, setIsResizing] = useState(false);
    // const [resizeDir, setResizeDir] = useState<{ widthDir: number, heightDir: number } | null>(null);


    const handleChange = ( e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
    };

    // const handleMouseDown = (e: React.MouseEvent) => {
    //     if (chatWindow.current && !isResizing) {
    //         setIsDragging(true);
    //     }
    // };
    //
    // // Handle mouse down for resizing
    // const handleMouseDownResize = (e: React.MouseEvent, widthDir: number, heightDir: number) => {
    //     e.stopPropagation(); // Prevent dragging while resizing
    //     setIsResizing(true);
    //     setResizeDir({ widthDir, heightDir });
    // };
    //
    // // Handle mouse movement for both dragging and resizing
    // const handleMouseMove = (e: MouseEvent) => {
    //     if (isDragging) {
    //         setPosition((prevPosition) => ({
    //             x: prevPosition.x + e.movementX,
    //             y: prevPosition.y + e.movementY,
    //         }));
    //     }
    //
    //     if (isResizing && resizeDir) {
    //         setSize((prevSize) => ({
    //             width: Math.max(100, prevSize.width + e.movementX * resizeDir.widthDir),
    //             height: Math.max(100, prevSize.height + e.movementY * resizeDir.heightDir),
    //         }));
    //     }
    // };
    //
    // // Stop dragging or resizing
    // const handleMouseUp = () => {
    //     setIsDragging(false);
    //     setIsResizing(false);
    //     setResizeDir(null);
    // };
    //
    // // Add global mouse event listeners for dragging and resizing
    // React.useEffect(() => {
    //     window.addEventListener('mousemove', handleMouseMove);
    //     window.addEventListener('mouseup', handleMouseUp);
    //
    //     return () => {
    //         window.removeEventListener('mousemove', handleMouseMove);
    //         window.removeEventListener('mouseup', handleMouseUp);
    //     };
    // }, [isDragging, isResizing, resizeDir]);

    const handleSubmit = () => {
        onMessageSent( message );
        setValue("");
    };

    const setChatWindowScrollPosition = () => {
        const _chatWindowBody = chatWindowBody.current;
        _chatWindowBody.scrollTop = _chatWindowBody.scrollHeight;
    };

    const autExpandInput = () => {
        const _userInput = userInput.current;
        _userInput.style.height = "auto";
        _userInput.style.height = `${_userInput.scrollHeight}px`;
    };

    useEffect(() => {
        fetch("https://ipinfo.io/json")
            .then(res => res.json())
            .then(({ ip }) => setIpAddress(ip));

        setFocusTrap(
            createFocusTrap(chatWindow.current, {
                clickOutsideDeactivates: true,
                fallbackFocus: chatWindow.current
            })
        );
    }, []);

    useEffect(() => {
        if (!focusTrap) return;

        if (isOpen) {
            focusTrap.activate();
        } else {
            focusTrap.deactivate();
        }
    }, [isOpen, focusTrap]);

    useEffect(() => {
        setChatWindowScrollPosition();
    }, [messages]);

    useEffect(() => {
        autExpandInput();
    }, [message]);

    return (
        <div
            ref={chatWindow}
            className={`chat-window ${isOpen ? 'is-open' : ''} chat-window--bottom-right`}
            // style={{
            //     left: position.x,
            //     top: position.y,
            //     width: size.width,
            //     height: size.height,
            //     position: 'absolute',
            //     backgroundColor: '#f0f0f0',
            //     border: '2px solid #333',
            //     cursor: isDragging ? 'grabbing' : 'grab',
            // }}
            // onMouseDown={handleMouseDown}
        >
            <div className="chat-window__header">
                <div className="chat-window__title">{title}</div>
                <button className="chat-window__close-btn" onClick={() => onClose()}>
                    <svg
                        version="1.1"
                        id="Layer_1"
                        xmlns="http://www.w3.org/2000/svg"
                        xmlnsXlink="http://www.w3.org/1999/xlink"
                        x="0px"
                        y="0px"
                        viewBox="0 0 512 512"
                        xmlSpace="preserve"
                    >
                        <path
                            d="M493.268,0H18.732C8.387,0,0,8.387,0,18.732v474.537C0,503.613,8.387,512,18.732,512h474.537
		c10.345,0,18.732-8.387,18.732-18.732V18.732C512,8.387,503.613,0,493.268,0z M358.763,332.273c7.315,7.314,7.315,19.175,0,26.49
		s-19.175,7.315-26.49,0L256,282.49l-76.273,76.273c-7.315,7.315-19.175,7.315-26.49,0c-7.315-7.314-7.315-19.175,0-26.49
		L229.51,256l-76.273-76.273c-7.315-7.314-7.315-19.175,0-26.49c7.314-7.314,19.175-7.314,26.49,0L256,229.51l76.273-76.273
		c7.314-7.314,19.175-7.314,26.49,0c7.315,7.314,7.315,19.175,0,26.49L282.49,256L358.763,332.273z"
                        />
                    </svg>
                </button>
            </div>
            <div ref={chatWindowBody} className="chat-window__body">
                {messages.map(({ originIpAddress, ...props }) => (
                    <ChatMessage
                        key={Math.random()}
                        isSameOrigin={originIpAddress === ipAddress}
                        {...props}
                    />
                ))}
            </div>
            <div className="chat-window__footer">
        <textarea
            ref={userInput}
            className="chat-window__input"
            rows="1"
            placeholder="Enter your message..."
            value={message}
            onChange={handleChange}
        />
                <button
                    className="chat-window__send-btn"
                    type="button"
                    onClick={() => handleSubmit()}
                    disabled={!message}
                >
                    Send
                </button>
            </div>
        </div>
    );
}

export default ChatWindow;
