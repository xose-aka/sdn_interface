import React, {useEffect, useRef, useState} from 'react';
import Message from "../Message";
import {createFocusTrap, FocusTrap} from "focus-trap";
import './index.scss'
import {IntentMessage, IntentMessageDTO} from "../../types";
import {v4 as uuidv4} from "uuid";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faComments, faRotate, faXmark} from "@fortawesome/free-solid-svg-icons";
import IntentAdditionTooltip from "../IntentAdditionTooltip";
import {ChatWindowProps} from "./index.types.ts";
import {prepareIntentMessage, prepareIntentMessageDTO} from "../../../topology/message.ts";
import {SenderTypes, Statuses} from "../../constants/intentMessage.ts";
import WindowButton from "../WindowButton";
import {sendConfirmConversation, sendMessage} from "../../services/api.ts";
import {alertTypes} from "../../../../constants";


function Index({
                   setShowAlert,
                   setAlertType,
                   setAlertMessage,
                   isOpen,
                   handleClose,
                   title,
                   token,
                   setIntentHighlightedNodes
}: ChatWindowProps) {

    const chatWindow = useRef<HTMLDivElement | null>(null);
    const chatWindowBody = useRef<HTMLDivElement | null>(null);
    const userInput = useRef<HTMLTextAreaElement | null>(null);

    const [focusTrap, setFocusTrap] = useState<FocusTrap | null>(null);

    // const [token, setToken] = useState<string | null>(null);
    const [chatHistory, setChatHistory] = useState<Array<any>>([]);

    const [messages, setMessages] = useState<IntentMessage[]>([]);
    const [pendingMessage, setPendingMessage] = useState<IntentMessageDTO | null>(null);

    const [isIntentAdditionTooltipOpen, setIsIntentAdditionTooltipOpen] = useState<boolean>(false);

    const [conversationId, setConversationId] = useState<string>(uuidv4());

    const [intentMessage, setIntentMessage] = useState("");

    // const [position, setPosition] = useState({ x: 0, y: 0 });
    // const [size, setSize] = useState({ width: 500, height: 300 });
    // const [isDragging, setIsDragging] = useState(false);
    // const [isResizing, setIsResizing] = useState(false);
    // const [resizeDir, setResizeDir] = useState<{ widthDir: number, heightDir: number } | null>(null);


    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setIntentMessage(event.target.value);
    };



    const handleConversationReset = () => {
        if (confirm("Do you want to reset conversation")) setConversationId(uuidv4());
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
    }, [intentMessage]);


    // Function to request a token from the backend
    // const getToken = async () => {
    //     try {
    //         const response = await axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TOKEN}`);
    //         const newToken = response.data.token;
    //         setToken(newToken);
    //         localStorage.setItem('chat_token', newToken); // Save token in localStorage
    //         return response.status
    //     } catch (error) {
    //         console.error('Error generating token:', error);
    //         return error
    //     }
    // };

    const submitMessage = () => {

        const newIntent = prepareIntentMessage(
            intentMessage,
            conversationId,
            Statuses["PENDING"],
            SenderTypes["USER"]
        )

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

        // Add the message to the local chat history
        setChatHistory(prevHistory => [...prevHistory, newIntent]);

        handleSendMessage(intentMessageDTO)
    }

    // Function to send a chat message to the server
    const handleSendMessage = (intentMessageDTO: IntentMessageDTO) => {
        if (!token) {
            setShowAlert(true)
            setAlertType(alertTypes.danger)
            setAlertMessage("No token set")
            return;
        }

        // if (pendingMessage === null) {
        //     setShowAlert(true)
        //     setAlertType(alertTypes.DANGER)
        //     setAlertMessage("No pending message")
        //     return;
        // }


            // Send message to the server
            sendMessage(token, intentMessageDTO)
                .then((response) => {

                    if (response != undefined) {
                        setChatHistory(prevHistory =>
                            prevHistory.map(msg =>
                                msg.id === response.intentId ? { ...msg, status: 'received' } : msg
                            )
                        );

                        setMessages(prevValues =>
                            prevValues.map(prevVal => {
                                if (
                                    prevVal.messageId === response.intentId &&
                                    prevVal.sender === SenderTypes["USER"]
                                ) {
                                    prevVal.isConfirmed = true
                                    prevVal.isConfirmationDone = true
                                    prevVal.status = Statuses["SENT"]
                                }

                                // server response loading update
                                if ( prevVal.messageId === response.responseMessageId ) {
                                    // messageItem.serverId = response.data.message.clientId
                                    prevVal.status = Statuses["RECEIVED"]
                                    prevVal.text = response.intent
                                }

                                return prevVal;
                            })
                        )
                    }
                })
                .catch((error) => {
                    setShowAlert(true)
                    setAlertType(alertTypes.danger)
                    setAlertMessage(error.message)

                    setChatHistory(prevHistory =>
                        prevHistory.map(msg =>
                            msg.id === intentMessageDTO.intentId ? { ...msg, status: Statuses["ERROR"] } : msg
                        )
                    );

                    setMessages(prevValues =>
                        prevValues.map(prevVal => {
                            if (
                                prevVal.messageId === intentMessageDTO.intentId &&
                                prevVal.sender === SenderTypes["USER"]
                            )
                                prevVal.status = Statuses["ERROR"]

                            return prevVal;
                        })
                    )

                })
    };

    const handleSendConfirmConversation = () => {
        if (!token) {
            console.error('No token found, generating one...');
            return;
        }

        if (conversationId === null) {
            return;
        }

        sendConfirmConversation(token, conversationId)
            .then((response) => {

                setConversationId(uuidv4())

                setMessages(prevValues =>
                    prevValues.map(prevVal => {
                        if (
                            prevVal.isConfirmationDone === false &&
                            prevVal.sender === SenderTypes["SERVER"]
                        ) {
                            prevVal.isConfirmed = true
                            prevVal.status = Statuses["RECEIVED"]
                            prevVal.isConfirmationDone = true
                        }

                        return prevVal;
                    })
                )
                setShowAlert(true)
                setAlertType(alertTypes.success)
                setAlertMessage("Path installed")
            })
            .catch((error) => {
                setShowAlert(true)
                setAlertType(alertTypes.danger)
                setAlertMessage(error.message)

                setConversationId(uuidv4())
                setMessages(prevValues =>
                    prevValues.map(prevVal => {
                        if (
                            prevVal.isConfirmationDone === false &&
                            prevVal.sender === SenderTypes["SERVER"]
                        ) {
                            prevVal.isConfirmed = false
                            prevVal.status = Statuses["ERROR"]
                            prevVal.isConfirmationDone = true
                        }

                        return prevVal;
                    })
                )

                // setChatHistory(prevHistory =>
                //     prevHistory.map(msg =>
                //         msg.id === intentMessageDTO.intentId ? { ...msg, status: Statuses["ERROR"] } : msg
                //     )
                // );
                //
                // setMessages(prevValues =>
                //     prevValues.map(prevVal => {
                //         if (
                //             prevVal.messageId === intentMessageDTO.intentId &&
                //             prevVal.sender === SenderTypes["USER"]
                //         )
                //             prevVal.status = Statuses["ERROR"]
                //
                //         return prevVal;
                //     })
                // )

            })
    };

    const handleSubmit = () => {
        submitMessage();
        setIntentMessage("");
        setIntentHighlightedNodes([])
    };

    const submitConfirmMessage = (isConfirm: boolean) => {

        if (isConfirm)
        {
            handleSendConfirmConversation()
        } else
        {
            setIsIntentAdditionTooltipOpen(true)

            setMessages(prevValues =>
                prevValues.map(prevVal => {
                    if (
                        prevVal.isConfirmationDone === false &&
                        prevVal.sender === SenderTypes["SERVER"]
                    ) {
                        prevVal.isConfirmed = false
                        prevVal.isConfirmationDone = true
                    }

                    return prevVal;
                })
            )
        }
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



        // sendMessage()
        //     .then((response) => {
        //
        //         if (response != undefined) {
        //             setChatHistory(prevHistory =>
        //                 prevHistory.map(msg =>
        //                     msg.id === pendingMessage?.intentId ? { ...msg, status: 'received' } : msg
        //                 )
        //             );
        //
        //             // setChatHistory(prevHistory => [...prevHistory, serverResponse]);
        //             // setMessages(prevMessage => [...prevMessage, serverResponse]);
        //
        //             const updatedMessages = messages.map(messageItem => {
        //                 // update client message send
        //                 if (
        //                     messageItem.messageId === pendingMessage?.intentId &&
        //                     messageItem.sender === SenderTypes["USER"]
        //                 ) {
        //                     messageItem.isConfirmed = true
        //                     messageItem.isConfirmationDone = true
        //                     messageItem.status = Statuses["RECEIVED"]
        //                 }
        //
        //                 // server response loading update
        //                 if ( messageItem.messageId === response.data.responseMessageId ) {
        //                     // messageItem.serverId = response.data.message.clientId
        //                     messageItem.status = Statuses["RECEIVED"]
        //                     messageItem.text = response.data.intent
        //                 }
        //
        //                 return messageItem;
        //             })
        //
        //             setMessages(updatedMessages)
        //             setPendingMessage(null)
        //         }
        //     })

    }, [JSON.stringify(pendingMessage)]);

    // Load token from localStorage or request a new one if not available
    // useEffect(() => {
    //
    //     if (isOpen) {
    //         const savedToken = localStorage.getItem('chat_token');
    //         if (savedToken) {
    //             setToken(savedToken);
    //         } else {
    //             getToken()
    //                 .then((returnMessage) => {
    //                     console.log(returnMessage)
    //                 }); // Generate new token if not found
    //         }
    //     }
    //
    // }, [isOpen]);

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
                <div className="d-flex justify-content-between">
                    <WindowButton handler={handleConversationReset} icon={faRotate} />
                    <WindowButton handler={handleClose} icon={faXmark}/>
                </div>
            </div>
            <div ref={chatWindowBody} className="chat-window__body">
                {messages.map(intentMessage => (
                    <Message
                        key={Math.random()}
                        message={intentMessage}
                        // pendingMessage={pendingMessage}
                        submitConfirmMessage={submitConfirmMessage}
                    />
                ))}
            </div>
            <div className="chat-window__footer">
                <IntentAdditionTooltip message={'Enter additional intent'}
                                       isIntentAdditionTooltipOpen={isIntentAdditionTooltipOpen}/>
                <textarea
                    ref={userInput}
                    className="chat-window__input"
                    rows={1}
                    placeholder="Enter your intent..."
                    value={intentMessage}
                    disabled={messages.some(message => message.isConfirmationDone === false && message.status === Statuses["RECEIVED"])}
                    onChange={handleChange}
                />
                        <button
                            className="chat-window__send-btn"
                            type="button"
                            onClick={() => handleSubmit()}
                            disabled={!intentMessage}
                        >
                            Send
                        </button>
            </div>
        </div>
    );
}

export default Index;
