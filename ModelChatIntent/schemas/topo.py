from typing import List

from pydantic import BaseModel


class TopoBuildModel(BaseModel):
    id: str
    neighbours: List[str]
    type: str


class TopoBuildRequest(BaseModel):
    nodes: List[TopoBuildModel]
