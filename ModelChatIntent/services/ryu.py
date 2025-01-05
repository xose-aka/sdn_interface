from exceptions.intent_format_exception import IntentFormatException
from exceptions.intent_goal_service_not_available_exception import IntentGoalServiceNotAvailableException
import requests
from cache.general import cache_topology_nodes_and_ip_addresses


def check_intent_nodes(processed_intent):
    node_id = processed_intent.get("node_id")
    node_id_without_space = str(node_id).replace(" ", "")

    print("available nodes: ", cache_topology_nodes_and_ip_addresses['nodes'])

    if node_id_without_space in cache_topology_nodes_and_ip_addresses['nodes']:
        return {
            "error": 0,
            "message": f"Node: {node_id} exists"
        }
    else:
        return {
            "error": 1,
            "message": f"Node: {node_id} doesn't exist"
        }


def check_intent_ips(processed_intent):
    ipv4_src = processed_intent.get("ip_source")
    ipv4_dst = processed_intent.get("ip_dest")

    if ipv4_src is None or ipv4_dst is None or ipv4_src == 'any' or ipv4_dst == 'any':
        return {
            "error": 0,
            "message": f"This check doesn't provided"
        }
    if ipv4_src not in cache_topology_nodes_and_ip_addresses['inserted_ip_addresses']:
        return {
            "error": 1,
            "message": f"IP address: {ipv4_src} doesn't exist"
        }
    elif ipv4_dst not in cache_topology_nodes_and_ip_addresses['inserted_ip_addresses']:
        return {
            "error": 1,
            "message": f"IP address: {ipv4_dst} doesn't exist"
        }
    else:
        return {
            "error": 0,
            "message": f"IP addresses exist"
        }


def check_intent_node_ports(processed_intent):
    goal = processed_intent.get("goal")

    if goal == "setWeights":
        weights = processed_intent.get("weights")

        node_id = processed_intent.get("node_id")
        node_id_without_space = str(node_id).replace(" ", "")


        if node_id_without_space in cache_topology_nodes_and_ip_addresses['nodes_ports']:
            intent_ports = weights.keys()
            node_ports = cache_topology_nodes_and_ip_addresses['nodes_ports'][node_id_without_space]

            print("intetn ports ", intent_ports)
            print("node ports ", node_ports)

            not_exist_port = None

            for intent_port in intent_ports:
                if int(intent_port) not in node_ports:
                    not_exist_port = intent_port

            if not_exist_port is not None:
                return {
                    "error": 1,
                    "message": f"Port {not_exist_port} doesn't exist"
                }

        return {
            "error": 0,
            "message": f"Ports exist"
        }
    # if ipv4_src not in cache_topology_nodes_and_ip_addresses['inserted_ip_addresses']:
    #     return {
    #         "error": 1,
    #         "message": f"IP address: {ipv4_src} doesn't exist"
    #     }
    # elif ipv4_dst not in cache_topology_nodes_and_ip_addresses['inserted_ip_addresses']:
    #     return {
    #         "error": 1,
    #         "message": f"IP address: {ipv4_dst} doesn't exist"
    #     }
    else:
        return {
            "error": 0,
            "message": f"Ports exist"
        }


def prepare_ryu_url_and_request_data(processed_intent):
    goal = processed_intent.get("goal")

    node_id = processed_intent.get("node_id")
    node_id_without_space = str(node_id).replace(" ", "")

    if node_id is None:
        raise IntentFormatException(value="dpid not found no such switch")
    elif node_id_without_space not in cache_topology_nodes_and_ip_addresses['nodes_dpid']:
        raise IntentFormatException(value=f"Configuration is not applicable for this node: {node_id}")
    else:
        dpid = cache_topology_nodes_and_ip_addresses['nodes_dpid'][node_id_without_space]

        if goal == "blockTraffic":
            ipv4_src = processed_intent.get("ip_source")
            ipv4_dst = processed_intent.get("ip_dest")
            request_data = {
                "ipv4_src": ipv4_src,
                "ipv4_dst": ipv4_dst
            }
            url = f"http://127.0.0.1:8080/simpleswitch/firewall/{dpid}"
        elif goal == "setWeights":
            weights = processed_intent.get("weights")

            request_data = {
                "weights": weights
            }
            url = f"http://127.0.0.1:8080/simpleswitch/weights/{dpid}"
            # url = f"http://127.0.0.1:8080/simpleswitch/weights"
        elif goal == "setRate":
            rate = processed_intent.get("rate")
            request_data = {
                "rate": rate
            }
            url = f"http://127.0.0.1:8080/simpleswitch/meters/{dpid}"

        elif goal == "deleteFlow":
            ipv4_src = processed_intent.get("ip_source")
            ipv4_dst = processed_intent.get("ip_dest")
            request_data = {
                "ipv4_src": ipv4_src,
                "ipv4_dst": ipv4_dst
            }
            url = f"http://127.0.0.1:8080/simpleswitch/rules/{dpid}"
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
