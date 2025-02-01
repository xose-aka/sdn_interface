from json import JSONDecodeError

import httpx
from httpx import HTTPStatusError, RequestError


async def request_post_external_data(url: str, data: dict, headers: dict = None, timeout: float = 10.0):
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=data, headers=headers)

            response.raise_for_status()

            # Try parsing JSON, return the JSON if valid
            try:
                return {
                    "success": True,
                    "status_code": response.status_code,
                    "data": response.json()
                }
            except JSONDecodeError:
                return {
                    "success": True,
                    "status_code": response.status_code,
                    "data": response.text.strip()  # Return raw text if JSON decoding fails
                }
    except HTTPStatusError as e:
        # Handle HTTP errors
        return {
            "success": False,
            "status_code": e.response.status_code,
            "error": str(e)
        }
    except RequestError as e:
        # Handle request errors (e.g., connection issues)
        return {
            "success": False,
            "status_code": 500,
            "error": f"Request error: {str(e)}"
        }
    except Exception as e:
        # Catch-all for unexpected exceptions
        return {
            "success": False,
            "status_code": 500,
            "error": f"Unexpected error: {str(e)}"
        }
