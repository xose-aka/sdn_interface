import {SenderTypes, Statuses} from "../constants/intentMessage.ts";

type SenderType = typeof SenderTypes[keyof typeof SenderTypes];
type Status = typeof Statuses[keyof typeof Statuses];

export interface IntentMessage {
    messageId: string; // Unique browser message ID (UUID or incrementing integer)
    serverId?: string; // Unique server message ID (UUID or incrementing integer)
    sender: SenderType; // Who sent the message
    text: string; // The message content
    timestamp: Date; // When the message was sent
    status: Status; // For tracking message delivery status
    sequence?: number; // For tracking message delivery status
    isConfirmed?: boolean | null; // is message confirmed
    isConfirmationDone?: boolean; // has this message already done or no
    conversationId?: string | null; // conversation id for intent's every message, till one conversation ends
}

export interface IntentMessageDTO {
    intentId: string; // Unique browser message ID (UUID or incrementing integer)
    responseMessageId: string; // Unique server message ID (UUID or incrementing integer)
    intent: string; // The message content
    timestamp: Date; // When the message was sent
    conversationId: string; // conversation id for intent's every message, till one conversation ends
}


