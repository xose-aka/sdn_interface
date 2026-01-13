import threading
from builtins import print

from fastapi import APIRouter
from mininet.clean import cleanup
from mininet.link import TCLink

from mininet.node import CPULimitedHost, OVSSwitch
from mininet.net import Mininet
from mininet.log import setLogLevel, info
from mininet.node import RemoteController
from classes.MininetTopology import MininetTopology
from mininet.cli import CLI
from cache.general import cache_topology_nodes_and_ip_addresses

from schemas.topo import TopoBuildRequest
from services.topology import configure_all_nodes

router = APIRouter()

stop_thread = threading.Event()
mininet_thread = None
net = None


@router.post("/build")
async def build_topology(topo: TopoBuildRequest):
    global mininet_thread, stop_thread, net

    # cleanup()

    if net is not None:
        print("Stopping the existing network...")
        net.stop()
        net = None

    my_topology = MininetTopology(topo.nodes)

    c = RemoteController('c', '0.0.0.0', 6633, cls=CPULimitedHost)
    # net = Mininet(topo=my_topology, controller=None, switch=OVSSwitch, link=TCLink)
    net = Mininet(topo=my_topology, controller=None, switch=OVSSwitch)

    net.addController(c)
    net.start()

    inserted_nodes_with_neighbours = my_topology.get_inserted_nodes()

    configure_all_nodes(net, inserted_nodes_with_neighbours)

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

    return {
        "error": 0,
        "data": cache_topology_nodes_and_ip_addresses
    }


def run_mininet(network):
    print("run cli")
    CLI(network)
    # network.stop()