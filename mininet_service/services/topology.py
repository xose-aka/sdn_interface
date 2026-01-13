import ipaddress

from mininet.net import Mininet
from mininet.node import Node

from cache.general import cache_topology_nodes_and_ip_addresses
from constants.general import NodeTypes


def configure_all_nodes(net: Mininet, inserted_nodes_with_neighbours: dict) -> None:
    for switch in net.switches:
        node_id = str(switch)

        switch.cmd('ovs-vsctl set bridge %s stp_enable=true' % switch.name)

        dpid = switch.dpid

        cache_topology_nodes_and_ip_addresses['nodes_dpid'][node_id] = dpid

        configure_each_node(switch, inserted_nodes_with_neighbours)

    for host in net.hosts:
        configure_each_node(host, inserted_nodes_with_neighbours)


def configure_each_node(node: Node, inserted_nodes_with_neighbours: dict) -> None:
    node_id = node.name

    cache_topology_nodes_and_ip_addresses['nodes_ports'][node_id] = list(node.ports.values())
    routers_ip_addresses = cache_topology_nodes_and_ip_addresses['routers_ip_addresses']

    for intf in node.intfList():

        if intf.link is not None:

            # set ip for host and router
            if node_id in inserted_nodes_with_neighbours:

                inserted_node_type_and_neighbours = inserted_nodes_with_neighbours[node_id]

                node_type = inserted_node_type_and_neighbours['type']

                intf1 = str(intf.link.intf1)

                intf2 = str(intf.link.intf2)

                if node_id in intf1:
                    node_intf = intf1
                    neighbour_intf = intf2
                elif node_id in intf2:
                    node_intf = intf2
                    neighbour_intf = intf1
                else:
                    continue

                # if node_type == NodeTypes.ROUTER:
                #     node.cmd("sysctl -w net.ipv4.ip_forward=1")

                neighbour_intf_split = neighbour_intf.split("-")

                neighbour_node_id = neighbour_intf_split[0]

                if neighbour_node_id in inserted_node_type_and_neighbours:
                    host_ip_for_connection = inserted_node_type_and_neighbours[neighbour_node_id]

                    if host_ip_for_connection is not None:

                        node.cmd(f'ifconfig {node_intf} {host_ip_for_connection} up')

                        if node_type == NodeTypes.HOST:
                            router_ip_address_with_mask = get_default_gateway(host_ip_for_connection)

                            if router_ip_address_with_mask is not None:
                                router_ip = router_ip_address_with_mask.split('/')[0]

                                node.cmd(f'route add default gw {router_ip}')

                    # set interface pair in order to use configuring ports in sdn interface client
                if node_intf not in cache_topology_nodes_and_ip_addresses['nodes_interfaces']:
                    cache_topology_nodes_and_ip_addresses['nodes_interfaces'].update({node_intf: neighbour_intf})

            else:
                print(f"Node: {node_id} hasn't been inserted to mininet nodes list")


def get_default_gateway(ip_address: str) -> str:
    routers_ip_addresses = cache_topology_nodes_and_ip_addresses['routers_ip_addresses']

    ip_address_network = ipaddress.ip_network(ip_address, strict=False)
    ip_network = None

    for router_ip_address in routers_ip_addresses:
        if router_ip_address is not None:  # Check if the value is not None
            print(f"router_ip_address {router_ip_address}")

            router_ip_address_network = ipaddress.ip_network(router_ip_address, strict=False)

            # Check if they belong to the same network
            if ip_address_network.network_address == router_ip_address_network.network_address:
                ip_network = router_ip_address
                break

    return ip_network
