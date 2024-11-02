export interface IntentMessage {
    id: string; // Unique message ID (UUID or incrementing integer)
    sender: 'user' | 'server'; // Who sent the message
    message: string; // The message content
    timestamp: Date; // When the message was sent
    status: 'sent' | 'received' | 'pending'; // For tracking message delivery status
}
