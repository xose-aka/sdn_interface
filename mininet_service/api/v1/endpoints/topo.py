import threading
from builtins import print

from fastapi import APIRouter
from fastapi import Depends
from fastapi.encoders import jsonable_encoder

from api.v1.dependencies import verify_token

from mininet.node import CPULimitedHost, OVSSwitch
from mininet.net import Mininet
from mininet.log import setLogLevel, info
from mininet.node import RemoteController
from classes.MininetTopology import MininetTopology
from mininet.cli import CLI
from cache.general import cache_topology_nodes_and_ip_addresses

from schemas.topo import TopoBuildRequest

router = APIRouter()

stop_thread = threading.Event()
mininet_thread = None


@router.post("/build")
async def build_topology(topo: TopoBuildRequest):
    global mininet_thread, stop_thread

    my_topology = MininetTopology(topo.nodes)

    c = RemoteController('c', '0.0.0.0', 6633, cls=CPULimitedHost)
    net = Mininet(topo=my_topology, controller=None, switch=OVSSwitch)

    net.addController(c)
    net.start()

    inserted_nodes_with_neighbours = my_topology.get_inserted_nodes()

    for switch in net.switches:
        node_id = str(switch)

        cache_topology_nodes_and_ip_addresses['nodes_ports'][node_id] = list(switch.ports.values())

        dpid = switch.defaultDpid()
        cache_topology_nodes_and_ip_addresses['nodes_dpid'][node_id] = dpid

        for intf in switch.intfList():
            print("Switch intf", intf)

            if intf.link is not None:

                switch_intf = str(intf.link.intf1)

                neighbour_intf = str(intf.link.intf2)

                # set interface pair in order to use configuring ports in sdn interface client
                if switch_intf not in cache_topology_nodes_and_ip_addresses['nodes_interfaces']:
                    cache_topology_nodes_and_ip_addresses['nodes_interfaces'].update({switch_intf: neighbour_intf})

    for host in net.hosts:

        node_id = host.name

        cache_topology_nodes_and_ip_addresses['nodes_ports'][node_id] = list(host.ports.values())

        for intf in host.intfList():

            if node_id in inserted_nodes_with_neighbours:

                node_neighbours = inserted_nodes_with_neighbours[node_id]

                host_intf = str(intf.link.intf2)

                neighbour_intf = str(intf.link.intf1)

                print("Links:", host_intf, neighbour_intf)

                neighbour_intf_split = neighbour_intf.split("-")

                neighbour_node_id = neighbour_intf_split[0]

                print("Intf:", neighbour_node_id, node_neighbours)

                if neighbour_node_id in node_neighbours:
                    host_ip_for_connection = node_neighbours[neighbour_node_id]

                    host.cmd(f'ifconfig {host_intf} {host_ip_for_connection} up')

                # set interface pair in order to use configuring ports in sdn interface client
                if host_intf not in cache_topology_nodes_and_ip_addresses['nodes_interfaces']:
                    cache_topology_nodes_and_ip_addresses['nodes_interfaces'].update({host_intf: neighbour_intf})
            else:
                print(f"Node: {node_id} hasn't been inserted to mininet nodes list")

    # net.pingAll()
    #
    # CLI(net)
    # net.stop()

    # Stop the previous thread if it's still running
    if mininet_thread and mininet_thread.is_alive():
        print("Stopping the previous Mininet thread...")
        stop_thread.set()  # Signal the thread to stop
        mininet_thread.join()  # Wait for the thread to terminate
        print("Previous Mininet thread stopped.")

    # Reset the stop flag for the new thread
    stop_thread.clear()

    # Start a new thread
    print("Starting a new Mininet thread...")
    mininet_thread = threading.Thread(target=run_mininet, args=(net,))
    mininet_thread.start()

    # def run_thread():
    #     run_mininet(topo.nodes)

    return {
        "error": 0,
        "data": cache_topology_nodes_and_ip_addresses
    }


def run_mininet(net):
    # CLI(net)
    net.stop()
