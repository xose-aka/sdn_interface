import {IntentMessage, IntentMessageDTO} from "../../types";

export interface MessageProps {
    message: IntentMessage
    pendingMessage: IntentMessageDTO | null
    submitConfirmMessage: (isConfirm: boolean) => void
}