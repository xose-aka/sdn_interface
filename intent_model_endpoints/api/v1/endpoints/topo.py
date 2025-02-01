import requests
from fastapi import APIRouter
from fastapi import Depends

from api.v1.dependencies import verify_token

from cache.general import cache_topology_nodes_and_ip_addresses
from requests.exceptions import ConnectionError

from schemas.topo import TopoBuildRequest

router = APIRouter()


@router.post("/build")
async def build_topology(topo: TopoBuildRequest, token: str = Depends(verify_token)):

    request_data = {
        'nodes': [model.dict() for model in topo.nodes],
    }

    print("request_data", request_data)

    try:

        response = requests.post(f"http://127.0.0.1:8002/api/v1/topology_builder/build", json=request_data)

        response_result = response.json()

        cache_topology_nodes_and_ip_addresses['nodes'] = response_result['data'].get('nodes', [])
        cache_topology_nodes_and_ip_addresses['inserted_ip_addresses'] = response_result['data'].get(
            'inserted_ip_addresses', [])
        cache_topology_nodes_and_ip_addresses['nodes_dpid'] = response_result['data'].get('nodes_dpid', {})
        cache_topology_nodes_and_ip_addresses['nodes_ports'] = response_result['data'].get('nodes_ports', {})

        return {
            "error": 0,
            "data": {
                "topology_interfaces": response_result['data'],
                "nodes_intents": cache_topology_nodes_and_ip_addresses["nodes_intents"]
            }
        }
    except requests.exceptions.JSONDecodeError:
        return {
            "error": 1,
            "data": "Decode error"
        }
    except ConnectionError as e:
        return {
            "error": 1,
            "data": str(e)
        }
