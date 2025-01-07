from fastapi import HTTPException


class AppException(HTTPException):
    """Base class for custom exceptions."""

    def __init__(self, status_code: int, detail: str):
        super().__init__(status_code=status_code, detail=detail)
