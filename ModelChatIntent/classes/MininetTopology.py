from mininet.topo import Topo
from cache.general import cache_topology_nodes_and_ip_addresses
from constants.general import NodeTypes
from mininet.examples.linuxrouter import LinuxRouter


class MininetTopology(Topo):

    def __init__(self, topology_nodes, **opts):

        """Create custom topo."""
        # Initialize topology
        super(MininetTopology, self).__init__(**opts)

        inserted_nodes = self.__insert_nodes(topology_nodes)

        cache_topology_nodes_and_ip_addresses['nodes'] = inserted_nodes.keys()

        # add links for neighbours
        insert_links = self.__insert_links(topology_nodes, inserted_nodes)

        cache_topology_nodes_and_ip_addresses['ip_addresses_with_mask'] = insert_links[
            'inserted_ip_addresses_with_mask']

        self.inserted_nodes = insert_links['inserted_nodes_and_neighbours']

    def __insert_nodes(self, nodes):

        inserted_nodes = {}
        host_counter = 0
        switch_counter = 0
        router_counter = 0
        opts = dict(protocols='OpenFlow13')

        for node in nodes:
            node_type = node.type
            node_id = node.id

            if node_type == NodeTypes.HOST:
                inserted_node_id = self.addHost(node_id)
                inserted_nodes[inserted_node_id] = {}
                host_counter += 1

            elif node_type == NodeTypes.SWITCH:
                inserted_node_id = self.addSwitch(node_id, opts=opts)
                inserted_nodes[inserted_node_id] = {}
                switch_counter += 1

            elif node_type == NodeTypes.ROUTER:
                inserted_node_id = self.addNode(node_id, cls=LinuxRouter)
                inserted_nodes[inserted_node_id] = {}
                router_counter += 1

            else:
                print(f"Node type doesn't exist {node_type}, node:{node}")

        print(f"Inserted hosts count: {host_counter}, "
              f"switches count: {switch_counter}, "
              f"routers count: {router_counter},"
              f"Total inserted nodes: {host_counter + switch_counter + router_counter}")

        return inserted_nodes

    def __insert_links(self, nodes, inserted_nodes):

        inserted_ip_addresses = []

        for node in nodes:
            node_id = node.id
            node_neighbours = node.neighbours

            for neighbour in node_neighbours:
                neighbour_node_id = neighbour.node
                connection_ip = neighbour.connection_ip

                if neighbour_node_id in inserted_nodes and node_id in inserted_nodes:
                    inserted_neighbours_of_neighbour = inserted_nodes[neighbour_node_id]
                    inserted_neighbors_of_node = inserted_nodes[node_id]

                    if (
                            node_id in inserted_neighbours_of_neighbour and
                            neighbour_node_id in inserted_neighbors_of_node
                    ):
                        inserted_nodes[node_id][neighbour_node_id] = connection_ip
                        inserted_ip_addresses.append(connection_ip)

                        print(f"Node id: {node_id}'s ip:{connection_ip} has been set to "
                              f"neighbour: {neighbour_node_id}.")

                    else:
                        self.addLink(node_id, neighbour_node_id, bw=100)

                        inserted_nodes[node_id][neighbour_node_id] = connection_ip
                        inserted_nodes[neighbour_node_id][node_id] = None

                        inserted_ip_addresses.append(connection_ip)

                        print(f"Node id: {node_id}'s ip:{connection_ip} and link has been set to "
                              f"neighbour: {neighbour_node_id}.")
                else:
                    print(f"Node: {node_id} or {neighbour_node_id} haven't been inserted yet!")

        return {
            "inserted_nodes_and_neighbours": inserted_nodes,
            "inserted_ip_addresses_with_mask": inserted_ip_addresses
        }

    def get_inserted_nodes(self):
        return self.inserted_nodes
