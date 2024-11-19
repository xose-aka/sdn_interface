import {v4 as uuidv4} from "uuid";
import {SenderTypes, Statuses} from "../intentChat/constants/intentMessage.ts";
import {IntentMessage, IntentMessageDTO} from "../intentChat/types";

export function prepareIntentMessage(message: string, conversationId: string, status: string, sender: string): IntentMessage {
    const messageId = uuidv4(); // Generate a unique ID (use UUID or similar)
    const timestamp = new Date(); // Current timestamp

    return  {
        messageId: messageId,
        sender: sender,
        text: message,
        timestamp: timestamp,
        status: status,  // Message is pending until server confirms
        isConfirmed: null,
        isConfirmationDone: false,
        conversationId: conversationId
    };
}

export function prepareIntentMessageDTO(
    intentId: string,
    responseMessageId: string,
    conversationId: string,
    intent: string
): IntentMessageDTO {
    const timestamp = new Date(); // Current timestamp

    return  {
        intentId: intentId, // Unique browser message ID (UUID or incrementing integer)
        responseMessageId: responseMessageId, // Unique server message ID (UUID or incrementing integer)
        intent: intent, // The message content
        timestamp: timestamp, // When the message was sent
        conversationId: conversationId, // conversation id for intent's every message, till one conversation ends
    };
}