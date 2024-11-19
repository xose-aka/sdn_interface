from json import JSONDecodeError

import httpx
from fastapi import HTTPException


async def request_post_external_data(url: str, data: dict, headers: dict = None, timeout: float = 10.0):
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=data, headers=headers)

            response.raise_for_status()

            if response.text.strip():
                return response.json()
            else:
                return response
    except httpx.HTTPStatusError as e:
        print("error ", str(e))
        raise HTTPException(status_code=e.response.status_code, detail=str(e))
    except httpx.RequestError as e:
        raise HTTPException(status_code=500, detail="External service unavailable")
    except JSONDecodeError:
        return response.text
