from fastapi import APIRouter
from fastapi import Depends
from api.v1.dependencies import verify_token

from mininet.node import CPULimitedHost
from mininet.topo import Topo
from mininet.net import Mininet
from mininet.log import setLogLevel, info
from mininet.node import RemoteController
from mininet.cli import CLI
import json

from schemas.topo import TopoBuildRequest

router = APIRouter()


def extract_json_data(text):
    # Find the start and end of the JSON data in the text.
    start_index = text.find("{")
    end_index = text.rfind("}")

    # Extract the JSON data from the text.
    json_data = text[start_index:end_index + 1]

    return json_data


nodes = {}
switches = {}
links = set()


class MyCustomTopology(Topo):

    def __init__(self, topoData, **opts):

        """Create custom topo."""
        # Initialize topology
        super(MyCustomTopology, self).__init__(**opts)

        opts = dict(protocols='OpenFlow13')
        #Assuming the file is named "output.txt"
        # file_path = 'output.txt'

        # Read the content of the file
        # with open(file_path, 'r') as file:
        #     json_data = file.read()

        # Extract JSON data from the text
        # extracted = extract_json_data(json_data)

        # Parse the JSON data into a Python dictionary
        try:
            #data = json.loads(extracted)
            data = topoData
            print(data)

            switch_counter = 0
            host_counter = 0

            for node_data in data["nodes"]:
                node_type = node_data["type"]
                node_id = node_data["id"]

                if node_type == "host":
                    host_counter = host_counter + 1
                    nodes[node_id] = self.addHost("h" + str(host_counter))
                elif node_type == "switch":
                    switch_counter = switch_counter + 1
                    obj = self.addSwitch("s" + str(switch_counter), opts=opts)
                    nodes[node_id] = obj
                    switches[node_id] = obj

            for node_data in data["nodes"]:
                node_id = node_data["id"]
                node_neighbors = node_data["neighbors"]

                for neighbor_id in node_neighbors:
                    link = tuple(sorted((node_id, neighbor_id)))
                    if link not in links:
                        self.addLink(node_id, neighbor_id, bw=100)
                        links.add(link)
                        print("added link " + node_id + "--->" + neighbor_id)
                    else:
                        print("already added link " + node_id + "--->" + neighbor_id)
        except json.JSONDecodeError as e:
            print(f"Error decoding JSON data: {e}")


@router.post("/build")
async def build_topt(topo: TopoBuildRequest, token: str = Depends(verify_token)):

    myTopology = MyCustomTopology(topo)

    # c = RemoteController('c', '0.0.0.0', 6633, cls=CPULimitedHost)
    # net = Mininet(topo=myTopology, controller=None)
    # net.addController(c)
    # net.start()
    # net.pingAll()
    # CLI(net)
    # net.stop()
