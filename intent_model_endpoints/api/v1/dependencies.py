# Verify the token (simplified for demo)
from fastapi import HTTPException, Header


async def verify_token(x_token: str = Header(...)):
    if not x_token:
        raise HTTPException(status_code=400, detail="Missing token")
    return x_token
