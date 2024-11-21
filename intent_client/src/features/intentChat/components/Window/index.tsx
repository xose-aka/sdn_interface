import React, { useEffect, useRef, useState} from 'react';
import Message from "../Message";
import {createFocusTrap, FocusTrap} from "focus-trap";
import './index.scss'
import axios, {AxiosResponse} from "axios";
import {IntentMessage, IntentMessageDTO} from "../../types";
import { v4 as uuidv4 } from "uuid";
import messageDate from "../../../../messages.json";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faComments} from "@fortawesome/free-solid-svg-icons";
import IntentAdditionTooltip from "../IntentAdditionTooltip";
import {ChatWindowProps} from "./index.types.ts";
import {prepareIntentMessageDTO, prepareIntentMessage} from "../../../topology/message.ts";
import {API_CONFIG} from "../../../../config/api.ts";
import {SenderTypes, Statuses} from "../../constants/intentMessage.ts";


function Index({
                   handleShowAlert,
                        isOpen,
                        onClose,
                        title,
                   message,
                   setIntentMessage,
                   setIntentHighlightedNodes
}: ChatWindowProps) {

    const chatWindow = useRef<HTMLDivElement | null>(null);
    const chatWindowBody = useRef<HTMLDivElement | null>(null);
    const userInput = useRef<HTMLTextAreaElement | null>(null);

    const [focusTrap, setFocusTrap] = useState<FocusTrap | null>(null);

    const [token, setToken] = useState<string | null>(null);
    const [chatResponse, setChatResponse] = useState<string>('');
    const [chatHistory, setChatHistory] = useState<Array<any>>([]);

    const [messages, setMessages] = useState<IntentMessage[]>([]);
    const [pendingMessage, setPendingMessage] = useState<IntentMessageDTO | null>(null);

    const [isIntentAdditionTooltipOpen, setIsIntentAdditionTooltipOpen] = useState<boolean>(false);

    const [conversationId, setConversationId] = useState<string>(uuidv4());

    let messageCounter = 0

    // const [position, setPosition] = useState({ x: 0, y: 0 });
    // const [size, setSize] = useState({ width: 500, height: 300 });
    // const [isDragging, setIsDragging] = useState(false);
    // const [isResizing, setIsResizing] = useState(false);
    // const [resizeDir, setResizeDir] = useState<{ widthDir: number, heightDir: number } | null>(null);


    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setIntentMessage(event.target.value);
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


    const setChatWindowScrollPosition = () => {
        const _chatWindowBody = chatWindowBody.current;
        if (_chatWindowBody !== null)
            _chatWindowBody.scrollTop = _chatWindowBody.scrollHeight;
    };

    const autExpandInput = () => {
        const _userInput = userInput.current;

        if (_userInput !== null) {
            _userInput.style.height = "auto";
            _userInput.style.height = `${_userInput.scrollHeight}px`;
        }
    };

    useEffect(() => {
        if (chatWindow.current) {
            setFocusTrap(
                createFocusTrap(chatWindow.current, {
                    clickOutsideDeactivates: true,
                    fallbackFocus: chatWindow.current
                })
            );
        }
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


    // Function to request a token from the backend
    const getToken = async () => {
        try {
            const response = await axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TOKEN}`);
            const newToken = response.data.token;
            setToken(newToken);
            localStorage.setItem('chat_token', newToken); // Save token in localStorage
            return response.status
        } catch (error) {
            console.error('Error generating token:', error);
            return error
        }
    };

    const submitMessage = () => {

        const newIntent = prepareIntentMessage(
            message,
            conversationId,
            Statuses["PENDING"],
            SenderTypes["USER"]
        )


        // Add the message to the local chat history
        setChatHistory(prevHistory => [...prevHistory, newIntent]);

        const serverResponseMessage = prepareIntentMessage(
            "Responding...",
            conversationId,
            Statuses["PENDING"],
            SenderTypes["SERVER"]
        )

        const intentMessageDTO = prepareIntentMessageDTO(
            newIntent.messageId,
            serverResponseMessage.messageId,
            conversationId,
            newIntent.text
        )

        setPendingMessage(intentMessageDTO)

        setMessages([
            ...messages,
            { ...newIntent },
            { ...serverResponseMessage }
        ]);
    }

    // Function to send a chat message to the server
    const sendMessage = async () => {
        if (!token) {
            console.error('No token found, generating one...');
            return;
        }

        if (pendingMessage === null) {
            return;
        }

        try {
            // Send message to the server
            return await axios.post<IntentMessageDTO>(
                `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MESSAGE_VERIFY}`,
                pendingMessage,
                { headers: { 'X-Token': token } }
            )
        } catch (error) {
            console.error('Error sending message:', error);
            // Handle error, e.g., retry mechanism
        }
    };

    const sendConfirmConversation = async () => {
        if (!token) {
            console.error('No token found, generating one...');
            return;
        }

        if (conversationId === null) {
            return;
        }

        try {
            // Send message to the server
            return await axios.post(
                `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MESSAGE_CONFIRM}`,
                {conversationId: conversationId},
                { headers: { 'X-Token': token } }
            )
        } catch (error) {
            console.error('Error sending message:', error);
            // Handle error, e.g., retry mechanism
        }
    };

    const handleSubmit = () => {
        submitMessage();
        setIntentMessage("");
        setIntentHighlightedNodes([])
    };

    const submitConfirmMessage = (isConfirm: boolean) => {

        // if (pendingMessage !== null) {

            // const modifyPendingMessage: IntentMessage = {
            //     messageId: pendingMessage.messageId,
            //     sender: pendingMessage.sender,
            //     text: pendingMessage.text,
            //     timestamp: pendingMessage.timestamp,
            //     status: pendingMessage.status,
            //     isConfirmed: isConfirm,
            //     isConfirmationDone: true
            // }

            if (isConfirm) {

                sendConfirmConversation()
                    .then((response) => {

                        setConversationId(uuidv4())

                        const updatedMessages = messages.map(messageItem => {

                            if (
                                messageItem.isConfirmationDone === false &&
                                messageItem.sender === SenderTypes["SERVER"]
                            ) {
                                messageItem.isConfirmed = true
                                messageItem.isConfirmationDone = true
                            }

                            return messageItem;
                        })

                        setMessages(updatedMessages)
                        handleShowAlert(true)
                })

            } else {

                setIsIntentAdditionTooltipOpen(true)
                const updatedMessages = messages.map(messageItem => {

                    if (
                        messageItem.isConfirmationDone === false &&
                        messageItem.sender === SenderTypes["SERVER"]
                    ) {
                        messageItem.isConfirmed = false
                        messageItem.isConfirmationDone = true
                    }

                    return messageItem;
                })

                setMessages(updatedMessages)
            }

            // setPendingMessage(modifyPendingMessage)
        // }
    }

    useEffect(() => {
        if (isIntentAdditionTooltipOpen) {
            const toRefIntentTooltip = setTimeout(() => {
                setIsIntentAdditionTooltipOpen(false);
                clearTimeout(toRefIntentTooltip);
            }, 4000);
        }

    }, [isIntentAdditionTooltipOpen]);

    useEffect(() => {
        sendMessage()
            .then((response) => {

                if (response != undefined) {
                    setChatHistory(prevHistory =>
                        prevHistory.map(msg =>
                            msg.id === pendingMessage?.intentId ? { ...msg, status: 'received' } : msg
                        )
                    );

                    // setChatHistory(prevHistory => [...prevHistory, serverResponse]);
                    // setMessages(prevMessage => [...prevMessage, serverResponse]);

                    const updatedMessages = messages.map(messageItem => {
                        // update client message send
                        if (
                            messageItem.messageId === pendingMessage?.intentId &&
                            messageItem.sender === SenderTypes["USER"]
                        ) {
                            messageItem.isConfirmed = true
                            messageItem.isConfirmationDone = true
                            messageItem.status = Statuses["RECEIVED"]
                        }

                        // server response loading update
                        if ( messageItem.messageId === response.data.responseMessageId ) {
                            // messageItem.serverId = response.data.message.clientId
                            messageItem.status = Statuses["RECEIVED"]
                            messageItem.text = response.data.intent
                        }

                        return messageItem;
                    })

                    setMessages(updatedMessages)
                    setPendingMessage(null)
                }
            })

    }, [JSON.stringify(pendingMessage)]);

    // Load token from localStorage or request a new one if not available
    useEffect(() => {

        if (isOpen) {
            const savedToken = localStorage.getItem('chat_token');
            if (savedToken) {
                setToken(savedToken);
            } else {
                getToken()
                    .then((returnMessage) => {
                        console.log(returnMessage)
                    }); // Generate new token if not found
            }
        }

    }, [isOpen]);

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
                <FontAwesomeIcon icon={faComments} inverse />
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
                {messages.map(intentMessage => (
                    <Message
                        key={Math.random()}
                        message={intentMessage}
                        pendingMessage={pendingMessage}
                        submitConfirmMessage={submitConfirmMessage}
                    />
                ))}
            </div>
            <div className="chat-window__footer">
                <IntentAdditionTooltip message={'Enter additional intent'} isIntentAdditionTooltipOpen={isIntentAdditionTooltipOpen}/>
                <textarea
                    ref={userInput}
                    className="chat-window__input"
                    rows={1}
                    placeholder="Enter your intent..."
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

export default Index;
