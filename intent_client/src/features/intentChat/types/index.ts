export interface IntentMessage {
    clientId: string; // Unique browser message ID (UUID or incrementing integer)
    serverId?: string; // Unique server message ID (UUID or incrementing integer)
    sender: 'user' | 'server'; // Who sent the message
    text: string; // The message content
    timestamp: Date; // When the message was sent
    status: 'sent' | 'received' | 'pending'; // For tracking message delivery status
    sequence?: number; // For tracking message delivery status
    isConfirmed?: boolean | null; // is message confirmed
    isConfirmationDone?: boolean; // has this message already done or no
}

