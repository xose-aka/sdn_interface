import React from "react";
import { CloseButtonProps } from "./index.types.ts";
import './index.scss'

export default function Index({ onClose }: CloseButtonProps) {

    return (
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
    )
}