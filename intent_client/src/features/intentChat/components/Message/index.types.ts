import {IntentMessage} from "../../types";

export interface MessageProps {
    message: IntentMessage
    submitConfirmMessage: (isConfirm: boolean) => void
}