from datetime import datetime

from fastapi import FastAPI, Depends, HTTPException, Header
from uuid import uuid4
from pydantic import BaseModel
from typing import Optional, List

app = FastAPI()

# In-memory store for demo purposes
user_tokens = {}

# Store chat messages with unique IDs
chat_messages = {}

# Pydantic models
class TokenResponse(BaseModel):
    token: str


class Message(BaseModel):
    message: str
    messageId: str
    timestamp: datetime

class ChatResponse(BaseModel):
    message: str
    history: List[Message]

# Endpoint to generate a unique token for a new user
@app.get("/generate-token", response_model=TokenResponse)
async def generate_token():
    token = str(uuid4())  # Generate a unique token (UUID)
    user_tokens[token] = []  # Initialize an empty chat history for this user
    return {"token": token}

# Verify the token (simplified for demo)
async def verify_token(x_token: str = Header(...)):
    if not x_token:
        raise HTTPException(status_code=400, detail="Missing token")
    return x_token

# Chat endpoint
@app.post("/chat", response_model=ChatResponse)
async def chat(message: Message, token: str = Depends(verify_token)):
    # Store the user message in the sequence (in-memory store for demo)
    chat_messages[message.messageId] = {
        "sender": "user",
        "message": message.message,
        "timestamp": message.timestamp
    }

    # Process the message and generate a server response
    server_message = {
        "messageId": str(uuid4()),  # Generate unique ID for server message
        "message": f"Server response to: {message.message}",
        "timestamp": datetime.now()
    }
    chat_messages[server_message["messageId"]] = server_message

    # Return the response to the client
    return {
        "message": server_message["message"],
        "history": [msg for msg in chat_messages.values()]  # Returning the full history
    }
