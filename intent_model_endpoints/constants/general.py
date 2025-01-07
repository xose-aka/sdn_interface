from enum import Enum


class NodeTypes(str, Enum):
    ROUTER = "router"
    SWITCH = "switch"
    HOST = "host"
