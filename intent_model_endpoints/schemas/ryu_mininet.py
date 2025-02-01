from pydantic import BaseModel, Field
from typing import Dict


class BlockTraffic(BaseModel):
    goal: str = Field(description="it must be set to blockTraffic")
    node_id: int = Field(description="the id that identifies the switch")
    ip_source: str = Field(description="the ip source address of the traffic to block ")
    ip_dest: str = Field(description="the ip destination address of the traffic to block ")


class LoadProfiling(BaseModel):
    goal: str = Field(description="it must be set to setWeights")
    node_id: int = Field(description="the id that identifies the switch")
    weights: Dict[int, int] = Field(description="the weights associated to the releted port as key ")


class DeleteFlow(BaseModel):
    goal: str = Field(description="it must be set to deleteFlow")
    node_id: int = Field(description="the id that identifies the switch")
    ip_source: str = Field(description="the ip source address of the rule to delete")
    ip_dest: str = Field(description="the ip destination address of the rule to delete ")


class RateLimiter(BaseModel):
    goal: str = Field(description="it must be set to setRate")
    node_id: int = Field(description="the id that identifies the switch")
    rate: int = Field(description="the rate to apply on the switch")
