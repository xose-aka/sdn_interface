from pydantic import BaseModel


class TopoBuildRequest(BaseModel):
    intentId: str