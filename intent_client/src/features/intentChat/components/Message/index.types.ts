import {IntentMessage} from "../../types";

export interface MessageProps {
    message: IntentMessage
    pendingMessage: IntentMessage | null
    submitConfirmMessage: (isConfirm: boolean) => void
}