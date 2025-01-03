import React, {useEffect, useRef, useState} from 'react';
import {createFocusTrap, FocusTrap} from "focus-trap";
import './NodeIntentsWindow.types.ts'
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faComments, faList, faXmark} from "@fortawesome/free-solid-svg-icons";
import {NodeIntentsWindowProps} from "./NodeIntentsWindow.types.ts";
import '../../../intentChat/components/Window/index.scss'
import '../../../intentChat/components/WindowButton/index.scss'
import '../../../intentChat/components/Message/index.scss'


function NodeIntentsWindow(
    {
        isOpen,
        handleClose,
        selectedNode
    }: NodeIntentsWindowProps) {
    console.log('rr')
    const chatWindow = useRef<HTMLDivElement | null>(null);
    const chatWindowBody = useRef<HTMLDivElement | null>(null);

    const [focusTrap, setFocusTrap] = useState<FocusTrap | null>(null);

    // const [position, setPosition] = useState({ x: 0, y: 0 });
    // const [size, setSize] = useState({ width: 500, height: 300 });
    // const [isDragging, setIsDragging] = useState(false);
    // const [isResizing, setIsResizing] = useState(false);
    // const [resizeDir, setResizeDir] = useState<{ widthDir: number, heightDir: number } | null>(null);

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


    selectedNode !== null &&
    selectedNode.data !== null &&
    Array.isArray(selectedNode.data.appliedIntetns) &&
    selectedNode.data.appliedIntetns.length > 0 &&
    (
        console.log('aa', selectedNode.data.appliedIntetns)
    )

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
                <FontAwesomeIcon icon={faList} inverse />
                <div className="chat-window__title">{ `${selectedNode?.data.label} Intent History` }</div>
                <div className="d-flex justify-content-between">
                    <div className="chat-window__close-btn" onClick={() => handleClose()}>
                        <FontAwesomeIcon icon={faXmark}/>
                    </div>
                </div>
            </div>
            <div ref={chatWindowBody} className="chat-window__body">
                {
                    selectedNode !== null &&
                    selectedNode.data !== null &&
                    Array.isArray(selectedNode.data.appliedIntetns) &&
                    selectedNode.data.appliedIntetns.length > 0 &&
                    (
                        selectedNode.data.appliedIntetns.map((intent, index) => (
                            <div className={'chat-message is-same-origin'} key={index}>
                                <div className="chat-message__item__timestamp">{"date"}</div>
                                <div className="chat-message__item">
                                    <span className="chat-message__item__text">
                                        {"message"}
                                    </span>
                                </div>
                            </div>
                        ))
                    )
                }
            </div>
        </div>
    );
}

export default NodeIntentsWindow;