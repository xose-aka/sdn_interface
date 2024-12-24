from exceptions.intent_format_exception import IntentFormatException
from exceptions.intent_goal_service_not_available_exception import IntentGoalServiceNotAvailableException
import requests
from cache.general import cache_topology_nodes_and_ip_addresses


def check_intent_nodes(processed_intent):
    node_id = processed_intent.get("node_id")

    if node_id in cache_topology_nodes_and_ip_addresses['nodes']:
        return {
            "error": 0,
            "message": f"Node: {node_id} exists"
        }
    else:
        return {
            "error": 1,
            "message": f"Node: {node_id} doesn't exist"
        }


def prepare_ryu_url_and_request_data(processed_intent):
    goal = processed_intent.get("goal")

    dpid = processed_intent.get("node_id")

    if dpid is None:
        raise IntentFormatException(value="dpid not found no such switch")
    else:
        filled_dpid = format(dpid, "d").zfill(16)

        if goal == "blockTraffic":
            ipv4_src = processed_intent.get("ip_source")
            ipv4_dst = processed_intent.get("ip_dest")
            request_data = {
                "ipv4_src": ipv4_src,
                "ipv4_dst": ipv4_dst
            }
            url = f"http://127.0.0.1:8080/simpleswitch/firewall/{filled_dpid}"
        elif goal == "setWeights":
            weights = processed_intent.get("weights")

            request_data = {
                "weights": weights
            }
            url = f"http://127.0.0.1:8080/simpleswitch/weights/{filled_dpid}"
            # url = f"http://127.0.0.1:8080/simpleswitch/weights"
        elif goal == "setRate":
            rate = processed_intent.get("rate")
            request_data = {
                "rate": rate
            }
            url = f"http://127.0.0.1:8080/simpleswitch/meters/{filled_dpid}"

        elif goal == "deleteFlow":
            ipv4_src = processed_intent.get("ip_source")
            ipv4_dst = processed_intent.get("ip_dest")
            request_data = {
                "ipv4_src": ipv4_src,
                "ipv4_dst": ipv4_dst
            }
            url = f"http://127.0.0.1:8080/simpleswitch/rules/{filled_dpid}"
        else:
            raise IntentGoalServiceNotAvailableException(value=f"Ryu hasn't method for this goal:{goal}")

    return {
        "url": url,
        "data": request_data
    }


def make_request(url, request_data):
    response = requests.post(url, json=request_data)
    if response.status_code == 200:
        print("Request successful")
    else:
        print(f"Request failed with status code: {response}")
