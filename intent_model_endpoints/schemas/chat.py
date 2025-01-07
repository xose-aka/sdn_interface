from datetime import datetime
from typing import List
from pydantic import BaseModel


class TokenResponse(BaseModel):
    token: str


class IntentMessageRequest(BaseModel):
    intentId: str
    responseMessageId: str
    intent: str
    timestamp: datetime
    conversationId: str


class ConfirmConversation(BaseModel):
    conversationId: str


class ChatResponse(BaseModel):
    message: IntentMessageRequest
    history: List[IntentMessageRequest]
