import React from "react";
import { WindowButtonProps } from "./index.types.ts";
import './index.scss'
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

export default function Index({ handler, icon }: WindowButtonProps) {

    return (
        <div className="chat-window__close-btn" onClick={() => handler()}>
            <FontAwesomeIcon icon={icon}/>
        </div>
    )
}