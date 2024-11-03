import React from 'react';
import './index.scss'
import {MessageProps} from "./index.types.ts";
import {Col, Row} from "react-bootstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCircleCheck, faRectangleXmark} from "@fortawesome/free-solid-svg-icons";

function Index({ message }: MessageProps)
{
    return (
        <div
            className={`chat-message ${message.sender == 'user' ? 'is-same-origin' : ''}`}
        >
            <div className="chat-message__item__timestamp">{message.timestamp.toString()}</div>
            <div className="chat-message__item">
                <span className="chat-message__item__text">{message.text}</span>
            </div>
            { message.sender == 'user' &&
                <div className="chat-message__item__text__confirmation bg-light border text-center mt-1">
                    <div className="mt-1">Do you confirm it ?</div>
                    <hr className="m-1"/>
                    <Row className="fs-6">
                        <Col>
                            <FontAwesomeIcon className="text-success cursor-pointer" icon={faCircleCheck} />
                        </Col>
                        <Col>
                            <FontAwesomeIcon className="text-danger cursor-pointer" icon={faRectangleXmark} />
                        </Col>
                    </Row>
                </div>
            }
        </div>
    );
}

export default Index;
