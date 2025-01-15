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
import {getToken} from "../../../../services/api.ts";


function Index({
                   showAlertHandler,
                   isOpen,
                   handleClose,
                   title,
                   token,
                   setToken,
                   setIntentHighlightedNodes,
                   applyIntentToNode,
                   isTopologyChanged
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

    // const [position, setPosition] = useState({ x: 'auto', y: 'auto' });
    // const [size, setSize] = useState({ width: 500, height: 300 });
    const [isDragging, setIsDragging] = useState(false);
    // const [isResizing, setIsResizing] = useState(false);
    // const [resizeDir, setResizeDir] = useState<{ widthDir: number, heightDir: number } | null>(null);


    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {

        if (isTopologyChanged) {
            showAlertHandler(alertTypes.warning, "Please update topology! By clicking \"Update topology\" button.")
        } else {
            setIntentMessage(event.target.value);
        }
    };



    const handleConversationReset = () => {
        if (confirm("Do you want to reset conversation")) setConversationId(uuidv4());
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        // if (chatWindow.current && !isResizing) {
        if (chatWindow.current ) {
            console.log('gg')
            setIsDragging(true);
        }
    };
    //
    // // Handle mouse down for resizing
    // const handleMouseDownResize = (e: React.MouseEvent, widthDir: number, heightDir: number) => {
    //     e.stopPropagation(); // Prevent dragging while resizing
    //     setIsResizing(true);
    //     setResizeDir({ widthDir, heightDir });
    // };
    //
    // // Handle mouse movement for both dragging and resizing
    const handleMouseMove = (e: MouseEvent) => {
        if (isDragging) {

            // setPosition((prevPosition) => ({
            //     // x: prevPosition.x + e.movementX,
            //     x: e.movementX,
            //     // y: prevPosition.y + e.movementY,
            //     y: e.movementY,
            // }));
        }

        // if (isResizing && resizeDir) {
        //     setSize((prevSize) => ({
        //         width: Math.max(100, prevSize.width + e.movementX * resizeDir.widthDir),
        //         height: Math.max(100, prevSize.height + e.movementY * resizeDir.heightDir),
        //     }));
        // }
    };
    //
    // // Stop dragging or resizing
    const handleMouseUp = () => {
        setIsDragging(false);
        // setIsResizing(false);
        // setResizeDir(null);
    };
    //
    // // Add global mouse event listeners for dragging and resizing
    React.useEffect(() => {
        // console.log('aa')
        // window.addEventListener('mousemove', handleMouseMove);
        // window.addEventListener('mouseup', handleMouseUp);
        //
        // return () => {
        //     window.removeEventListener('mousemove', handleMouseMove);
        //     window.removeEventListener('mouseup', handleMouseUp);
        // };
    }, [isDragging
        // , isResizing, resizeDir
    ]);


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
            showAlertHandler(alertTypes.primary, "No token set")

            getToken()
                .then(response => {
                    setToken(response.data.token)
                })
                .catch(error => {
                    showAlertHandler(alertTypes.warning, `Could not fetch token, error:${error}`)
                });

            setMessages((prevMessages) =>
                prevMessages.filter((message) => !( message.conversationId === conversationId &&
                        message.status === Statuses["PENDING"] &&
                        message.sender === SenderTypes["SERVER"] )
                )
            );

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

                    const responseMessageStatus = response.error ? Statuses["ERROR"] : Statuses["RECEIVED"]

                    const responseData = response.data

                    // if (response.error) {
                        setChatHistory(prevHistory =>
                            prevHistory.map(msg =>
                                msg.id  === responseData.intentId ? { ...msg, status: Statuses["RECEIVED"] } : msg
                            )
                        );

                        setMessages(prevValues =>
                            prevValues.map(prevVal => {
                                if (
                                    prevVal.messageId === responseData.intentId &&
                                    prevVal.sender === SenderTypes["USER"]
                                ) {
                                    prevVal.isConfirmed = true
                                    prevVal.isConfirmationDone = true
                                    prevVal.status = Statuses["SENT"]
                                }

                                // server response loading update
                                if ( prevVal.messageId === responseData.responseMessageId ) {
                                    // messageItem.serverId = response.data.message.clientId
                                    prevVal.status = responseMessageStatus
                                    prevVal.text = responseData.message
                                }

                                return prevVal;
                            })
                        )
                    // }


                })
                .catch((error) => {
                    showAlertHandler(alertTypes.danger, `Could not fetch token, error:${error.message}`)

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

                console.log("conversation ", response)

                applyIntentToNode(response.data)

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

                showAlertHandler(alertTypes.success, `Path installed`)
            })
            .catch((error) => {
                showAlertHandler(alertTypes.danger, error.message)

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

    return (
        <div
            ref={chatWindow}
            className={`chat-window ${isOpen ? 'is-open' : ''} chat-window--bottom-right`}
            style={{
                // left: position.x,
                // top: position.y,
                // width: size.width,
                // height: size.height,
                // position: 'absolute',
                // backgroundColor: '#f0f0f0',
                // border: '2px solid #333',
                // cursor: isDragging ? 'grabbing' : 'grab',
            }}
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
                {
                    messages.map(intentMessage => (
                        <Message
                            key={Math.random()}
                            message={intentMessage}
                            // pendingMessage={pendingMessage}
                            submitConfirmMessage={submitConfirmMessage}
                        />
                    ))
                }
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
                    disabled={!intentMessage}>
                    Send
                </button>
            </div>
        </div>
    );
}

export default Index;
