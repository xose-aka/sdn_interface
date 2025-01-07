from typing import List, Optional

from pydantic import BaseModel


class NeighbourModel(BaseModel):
    node: str
    connection_ip: Optional[str] = None


class TopoBuildModel(BaseModel):
    id: str
    neighbours: List[NeighbourModel]
    type: str


class TopoBuildRequest(BaseModel):
    nodes: List[TopoBuildModel]
