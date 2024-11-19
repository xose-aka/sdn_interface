from uuid import uuid4

from fastapi import APIRouter

from schemas.chat import TokenResponse

router = APIRouter()

# In-memory store for demo purposes
user_tokens = {}


@router.get("/generate-token", response_model=TokenResponse)
async def generate_token():
    token = str(uuid4())  # Generate a unique token (UUID)
    user_tokens[token] = []  # Initialize an empty chat history for this user
    return {"token": token}
