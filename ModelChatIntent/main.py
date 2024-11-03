from datetime import datetime

from fastapi import FastAPI, Depends, HTTPException, Header
from uuid import uuid4
from pydantic import BaseModel
from typing import List
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this to specify allowed origins
    allow_credentials=True,
    allow_methods=["*"],  # Adjust this to specify allowed HTTP methods
    allow_headers=["*"],  # Adjust this to specify allowed headers
)

# In-memory store for demo purposes
user_tokens = {}

# Store chat messages with unique IDs
chat_messages = {}

# Store chat messages history with unique IDs
chat_response_history = []

# Pydantic models
class TokenResponse(BaseModel):
    token: str


class Message(BaseModel):
    text: str
    id: str
    timestamp: datetime

class ChatResponse(BaseModel):
    message: Message
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
# @app.post("/chat", response_model=ChatResponse)
@app.post("/chat", response_model=ChatResponse)
async def chat(message: Message, token: str = Depends(verify_token)):
    # Store the user message in the sequence (in-memory store for demo)
    chat_messages[message.id] = {
        "sender": "user",
        "text": message.text,
        "timestamp": message.timestamp
    }

    # Process the message and generate a server response
    server_message = {
        "id": str(uuid4()),  # Generate unique ID for server message
        "text": f"Server response to: {message.text}",
        "timestamp": datetime.now()
    }
    chat_messages[server_message["id"]] = server_message
    chat_response_history.append(server_message)

    print("Values ", server_message)

    # Return the response to the client
    return {
        "message": server_message,
        "history": [msg for msg in chat_response_history]  # Returning the full history
    }
