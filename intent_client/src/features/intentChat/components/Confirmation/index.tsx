import {Col, Row} from "react-bootstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCircleCheck, faRectangleXmark} from "@fortawesome/free-solid-svg-icons";
import React from "react";
import {ConfirmationProps} from "./index.types.ts";
import './index.scss'

export default function Index({ submitConfirmMessage, children }: ConfirmationProps) {
    return (
        <div className="chat-message__item__text__confirmation bg-light border text-center mt-1">
            <div className="mt-1">{children}</div>
            <hr className="m-1"/>
            <Row className="fs-6">
                <Col>
                    <FontAwesomeIcon className="text-success cursor-pointer"
                                     icon={faCircleCheck}
                                     onClick={() => submitConfirmMessage(true)}/>
                </Col>
                <Col>
                    <FontAwesomeIcon className="text-danger cursor-pointer"
                                     icon={faRectangleXmark}
                                     onClick={() => submitConfirmMessage(false)}/>
                </Col>
            </Row>
        </div>
    )
}