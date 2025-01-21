from mininet.net import Mininet
from mininet.node import Node

from cache.general import cache_topology_nodes_and_ip_addresses
from constants.general import NodeTypes


def configure_all_nodes(net: Mininet, inserted_nodes_with_neighbours: dict) -> None:
    for switch in net.switches:
        node_id = str(switch)

        dpid = switch.defaultDpid()
        cache_topology_nodes_and_ip_addresses['nodes_dpid'][node_id] = dpid

        configure_each_node(switch, inserted_nodes_with_neighbours)

    for host in net.hosts:
        configure_each_node(host, inserted_nodes_with_neighbours)


def configure_each_node(node: Node, inserted_nodes_with_neighbours: dict) -> None:
    node_id = node.name

    cache_topology_nodes_and_ip_addresses['nodes_ports'][node_id] = list(node.ports.values())

    for intf in node.intfList():

        if intf.link is not None:

            # set ip for host and router
            if node_id in inserted_nodes_with_neighbours:

                inserted_node_type_and_neighbours = inserted_nodes_with_neighbours[node_id]

                node_type = inserted_node_type_and_neighbours['type']

                if node_type == NodeTypes.HOST:

                    node_intf = str(intf.link.intf1)

                    neighbour_intf = str(intf.link.intf2)

                elif node_type == NodeTypes.ROUTER:

                    node_intf = str(intf.link.intf2)

                    neighbour_intf = str(intf.link.intf1)

                    node.cmd("sysctl -w net.ipv4.ip_forward=1")

                else:
                    continue

                neighbour_intf_split = neighbour_intf.split("-")

                neighbour_node_id = neighbour_intf_split[0]

                if neighbour_node_id in inserted_node_type_and_neighbours:
                    host_ip_for_connection = inserted_node_type_and_neighbours[neighbour_node_id]

                    node.cmd(f'ifconfig {node_intf} {host_ip_for_connection} up')

                    # set interface pair in order to use configuring ports in sdn interface client
                if node_intf not in cache_topology_nodes_and_ip_addresses['nodes_interfaces']:
                    cache_topology_nodes_and_ip_addresses['nodes_interfaces'].update({node_intf: neighbour_intf})

            else:
                print(f"Node: {node_id} hasn't been inserted to mininet nodes list")
