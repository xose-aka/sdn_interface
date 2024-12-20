from fastapi import APIRouter
from fastapi import Depends
from mininet.examples.linuxrouter import LinuxRouter
from mininet.util import dumpNodeConnections

from api.v1.dependencies import verify_token

from mininet.node import CPULimitedHost, Host
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

    def __init__(self, topology_nodes, **opts):
        inserted_nodes = {}

        # def build(self, topology_nodes, **opts):
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
            # data = nodes
            # print(data)

            switch_counter = 0
            host_counter = 0

            # self.addHost("h1")
            # self.addHost("h2")
            #
            # link_key = self.addLink("h1", "h2")

            for node in topology_nodes:
                node_type = node.type
                node_id = node.id

                if node_type == "host":
                    host_counter = host_counter + 1
                    inserted_node_id = self.addHost(node_id)
                    nodes[node_id] = inserted_node_id
                    inserted_nodes[inserted_node_id] = {}
                elif node_type == "switch":
                    switch_counter = switch_counter + 1
                    inserted_node_id = self.addSwitch(node_id, opts=opts)
                    nodes[node_id] = inserted_node_id
                    switches[node_id] = inserted_node_id
                    inserted_nodes[inserted_node_id] = {}
                elif node_type == "router":
                    switch_counter = switch_counter + 1
                    inserted_node_id = self.addNode(node_id, cls=LinuxRouter)
                    nodes[node_id] = inserted_node_id
                    inserted_nodes[inserted_node_id] = {}

            # add links for neighbours
            for node in topology_nodes:
                node_id = node.id
                node_neighbours = node.neighbours

                for neighbour in node_neighbours:
                    neighbour_node_id = neighbour.node
                    this_node_ip = neighbour.connection_ip

                    if neighbour_node_id in inserted_nodes and node_id in inserted_nodes:
                        neighbour_inserted_neighbours = inserted_nodes[neighbour_node_id]
                        node_inserted_neighbors = inserted_nodes[node_id]

                        if node_id in neighbour_inserted_neighbours and neighbour_node_id in node_inserted_neighbors:
                            inserted_nodes[node_id][neighbour_node_id] = this_node_ip
                        # inserted_nodes[neighbour_node_id][node_id] = this_node_ip
                        # elif neighbour_node_id in node_inserted_neighbors:

                        else:
                            self.addLink(node_id, neighbour_node_id, bw=100)

                            inserted_nodes[node_id][neighbour_node_id] = this_node_ip
                            inserted_nodes[neighbour_node_id][node_id] = None
                #     # link = tuple(sorted((node_id, neighbor)))
                #     if link not in links:
                #         self.addLink(node_id, neighbor, bw=100)
                #         links.add(link)
                #         print("added link " + node_id + "--->" + neighbor)
                #     else:
                #         print("already added link " + node_id + "--->" + neighbor)
            self.inserted_nodes = inserted_nodes
        except json.JSONDecodeError as e:
            print(f"Error decoding JSON data: {e}")

    def get_inserted_nodes(self):
        return self.inserted_nodes


@router.post("/build")
async def build_topt(topo: TopoBuildRequest, token: str = Depends(verify_token)):
    my_topology = MyCustomTopology(topo.nodes)
    #
    c = RemoteController('c', '0.0.0.0', 6633, cls=CPULimitedHost)
    net = Mininet(topo=my_topology, controller=None)
    net.addController(c)
    net.start()
    # print( "Dumping host connections" )
    #

    print(my_topology.get_inserted_nodes())
    for host in net.hosts:
        # print(host.name + " ")

        for intf in host.intfList():
            print(intf)

            # if intf.link and host.name == "h1":
            #     # intfs = [ intf.link.intf1, intf.link.intf2 ]
            #     # intfs.remove( intf )
            #     # print( intfs[ 0 ] )
            #     print(intf.link)
            #     host.cmd(f'ifconfig ${intf} 10.0.0.1/24')
            # elif intf.link and host.name == "h2":
            #     # intfs = [ intf.link.intf1, intf.link.intf2 ]
            #     # intfs.remove( intf )
            #     # print( intfs[ 0 ] )
            #     host.cmd(f'ifconfig ${intf} 10.0.0.2/24')
            # else:
            #     print( ' ' )

    # print( "Testing network connectivity" )
    #
    # dumpNodeConnections(net.hosts)
    # net.pingAll()
    #
    # CLI(net)
    net.stop()
