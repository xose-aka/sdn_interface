import os
import sys

from ryu.base import app_manager
from ryu.controller import ofp_event
from ryu.controller.handler import CONFIG_DISPATCHER, MAIN_DISPATCHER
from ryu.controller.handler import set_ev_cls
from ryu.ofproto import ofproto_v1_3
from ryu.lib.packet import packet
from ryu.lib.packet import arp
from ryu.lib.packet import ethernet
from ryu.lib.packet import ipv6
from ryu.topology import event
from ryu.app.wsgi import WSGIApplication
from collections import defaultdict
import random
import time

from SimpleSwitchController import SimpleSwitchController
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))


class GeneralException(Exception):
    def __init__(self, message):
        self.message = message


simple_switch_instance_name = 'simple_switch_api_app'
url = '/simpleswitch/mactable/{dpid}'

# Cisco Reference bandwidth = 1 Gbps
REFERENCE_BW = 10000000

DEFAULT_BW = 10000000

MAX_PATHS = 4


class ProjectController(app_manager.RyuApp):
    OFP_VERSIONS = [ofproto_v1_3.OFP_VERSION]
    _CONTEXTS = {'wsgi': WSGIApplication}

    def __init__(self, *args, **kwargs):
        super(ProjectController, self).__init__(*args, **kwargs)
        wsgi = kwargs['wsgi']
        wsgi.register(SimpleSwitchController,
                      {simple_switch_instance_name: self})
        # list_routes(wsgi)

        self.mac_to_port = {}
        self.topology_api_app = self
        self.datapath_list = {}
        self.arp_table = {}
        self.switches = []
        self.hosts = {}
        self.multipath_group_ids = {}
        self.group_ids = []
        self.adjacency = defaultdict(dict)
        self.bandwidths = defaultdict(lambda: defaultdict(lambda: DEFAULT_BW))
        self.switch_port_count = {}
        self.switch_out_ports = {}
        self.port_num = 1  # Modify this to the actual incoming port number
        self.rate_limit = 30000000  # Modify this to the desired rate limit (kbps)
        self.meter_installed = {}
        self.time = [0, 0]

    def set_rate(self, dpid, rate):
        dp = self.datapath_list[dpid]

        # Check if the datapath exists
        if dp is None:
            raise GeneralException(f"Datapath with ID {dpid} does not exist.")

        # Check if the meter is installed for this datapath
        if dpid not in self.meter_installed:
            raise GeneralException(f"Meter is not installed for datapath {dpid}.")

        ofproto = dp.ofproto
        parser = dp.ofproto_parser
        print(rate)

        # Modify the meter rate
        meter_id = dpid  # Assuming meter_id is the same as dpid
        meter_mod = parser.OFPMeterMod(
            datapath=dp,
            command=ofproto.OFPFC_MODIFY,
            flags=ofproto.OFPMF_KBPS,
            meter_id=meter_id,
            bands=[parser.OFPMeterBandDrop(rate=rate)]
        )
        dp.send_msg(meter_mod)

    ##########FUNCTIONS RELETED TO THE REST APIS#######################################################
    #function to block ip traffic , it can block taffic on dirrent on src and dst, only src or only dst
    #example of rest request : curl -X POST -d '{"ipv4_src" : "10.0.0.1","ipv4_dst" : "10.0.0.2"}' http://127.0.0.1:8080/simpleswitch/firewall/0000000000000001
    def block_ip_traffic(self, dpid, entry):

        computation_start = time.time()
        dp = self.datapath_list[dpid]

        print(entry)

        ipv4_src = None
        ipv4_dst = None

        #extract the addres from the entry
        if 'ipv4_src' in entry:
            ipv4_src = entry['ipv4_src']
        if 'ipv4_dst' in entry:
            ipv4_dst = entry['ipv4_dst']

        #prepare the match for the flow
        if dp is not None:

            parser = dp.ofproto_parser

            if ipv4_src != "any" and ipv4_dst != "any":

                match = parser.OFPMatch(
                    eth_type=0x0800,
                    ipv4_src=ipv4_src,
                    ipv4_dst=ipv4_dst
                )
                #print("ipv4_src and ipv4_dst")
            elif ipv4_dst != "any":

                match = parser.OFPMatch(
                    eth_type=0x0800,
                    ipv4_dst=ipv4_dst
                )
                #print("ipv4_dst", ipv4_dst)

            elif ipv4_src != "any":

                match = parser.OFPMatch(
                    eth_type=0x0800,
                    ipv4_src=ipv4_src
                )
                #print("ipv4_src", ipv4_src)

            actions = []  # Empty action list to drop the packets

            if match is None:
                raise Exception("Source and destination ip addresses are not indicated")

            # Add a flow rule to block IP traffic

            self.add_flow(dp, 2, match, actions, 0, 1)
            print("Path installation finished in", (time.time() - computation_start) * 1000, "milliseconds")
            #self.logger.info("Dropping ip flow : %s <---> %s ", ipv4_src, ipv4_dst)

    #function to update the weights on the ports to make load profiling
    #example of rest request : curl -X POST -d '{"weights" : [2,3,4]}' http://127.0.0.1:8080/simpleswitch/weights/0000000000000001
    def set_weights(self, dpid, weights):
        data = self.multipath_group_ids
        dpid = dpid
        dp = self.datapath_list[dpid]
        #print(dp)
        ofp = dp.ofproto
        ofp_parser = dp.ofproto_parser
        #extract the rules on each port
        result_entries = [value for key, value in data.items() if key[0] == dpid]
        print(weights)

        if result_entries:
            print("Entries found:")
            for entry in result_entries:
                print(entry)
        else:
            print("No entries found for the given input.")

        for entry in result_entries:
            out_ports = entry[7]
            if len(out_ports) != len(weights):
                return GeneralException(
                    "The number of weights are not equal to the number of port available for the load profiling")

            group_id = entry[0]
            #print(out_ports)
            ip_src = entry[5]
            #print(ip_src)
            ip_dst = entry[6]
            #print(ip_dst)
            buckets = []

            match_ip = ofp_parser.OFPMatch(
                eth_type=0x0800,
                ipv4_src=ip_src,
                ipv4_dst=ip_dst
            )
            counter = 0

            for port, weight in out_ports:
                bucket_weight = weights[counter]
                bucket_action = [ofp_parser.OFPActionOutput(port)]

                buckets.append(
                    ofp_parser.OFPBucket(
                        weight=bucket_weight,
                        watch_port=port,
                        watch_group=ofp.OFPG_ANY,
                        actions=bucket_action
                    )
                )
                counter = counter + 1

            req = ofp_parser.OFPGroupMod(
                dp, ofp.OFPGC_MODIFY, ofp.OFPGT_SELECT,
                group_id, buckets)
            dp.send_msg(req)

            actions = [ofp_parser.OFPActionGroup(group_id)]

            self.add_flow(dp, 1, match_ip, actions, 0, 0)

    #function to remove a flow given the match
    #example of rest request : curl -X POST -d '{"weights" : [2,3,4]}' http://127.0.0.1:8080/simpleswitch/weights/0000000000000001

    def remove_flow(self, datapath, match, cookie):

        ofproto = datapath.ofproto
        parser = datapath.ofproto_parser

        # Constructing the flow deletion message based on the match criteria
        mod = parser.OFPFlowMod(
            datapath=datapath,
            cookie=cookie,
            match=match,
            cookie_mask=0xFFFFFFFFFFFFFFFF,
            table_id=ofproto.OFPTT_ALL,
            command=ofproto.OFPFC_DELETE,
            out_port=ofproto.OFPP_ANY,
            out_group=ofproto.OFPG_ANY
        )

        # Sending the flow deletion message
        datapath.send_msg(mod)

    def add_ports(self, switch):
        # Fetch switch ports and populate the switch_port_count dictionary
        self.switch_port_count[switch.id] = len(switch.ports)
        print(self.switch_port_count)

    def get_hosts(self):

        ip_mac_dict = self.arp_table

        sorted_ips = sorted(ip_mac_dict.items(), key=lambda x: tuple(map(int, x[0].split('.'))))
        sorted_dict = dict(sorted_ips)

        new_dict = {}
        for index, (ip, mac) in enumerate(sorted_dict.items(), start=1):
            new_dict[f'h{index}'] = {'ip': ip}

        return new_dict

    def get_out_ports(self, dpid):

        data = self.multipath_group_ids
        dpid = dpid
        dp = self.datapath_list[dpid]
        ofp = dp.ofproto
        ofp_parser = dp.ofproto_parser
        #extract the rules on each port
        result_entries = [value for key, value in data.items() if key[0] == dpid]

        if result_entries:
            print("Entries found:")
            for entry in result_entries:
                print(entry)
        else:
            print("No entries found for the given input.")

        for entry in result_entries:
            out_ports = entry[7]

    def get_paths(self, src, dst):
        '''
        Get all paths from src to dst using DFS algorithm
        '''
        if src == dst:
            # host target is on the same switch
            return [[src]]
        paths = []
        stack = [(src, [src])]
        while stack:
            (node, path) = stack.pop()
            for next in set(self.adjacency[node].keys()) - set(path):
                if next is dst:
                    paths.append(path + [next])
                else:
                    stack.append((next, path + [next]))
        print("Available paths from ", src, " to ", dst, " : ", paths)
        return paths

    def get_link_cost(self, s1, s2):
        '''
        Get the link cost between two switches
        '''
        e1 = self.adjacency[s1][s2]
        e2 = self.adjacency[s2][s1]
        bl = min(self.bandwidths[s1][e1], self.bandwidths[s2][e2])
        ew = REFERENCE_BW / bl
        return ew

    def get_path_cost(self, path):
        '''
        Get the path cost
        '''
        cost = 0
        for i in range(len(path) - 1):
            cost += self.get_link_cost(path[i], path[i + 1])
        return cost

    def get_optimal_paths(self, src, dst):
        '''
        Get the n-most optimal paths according to MAX_PATHS
        '''
        paths = self.get_paths(src, dst)
        paths_by_second_num = {}

        if len(paths) > 1:

            # Group paths by their second number
            for path in paths:
                second_number = path[1]
                if second_number not in paths_by_second_num:
                    paths_by_second_num[second_number] = path
                else:
                    # Keep the shortest path if a path with the same second number already exists
                    if len(path) < len(paths_by_second_num[second_number]):
                        paths_by_second_num[second_number] = path

            # Retrieve the shortest paths with different second numbers
            shortest_paths = list(paths_by_second_num.values())
            return shortest_paths
        else:
            return paths

    def add_ports_to_paths(self, paths, first_port, last_port):
        '''
        Add the ports that connects the switches for all paths
        '''
        paths_p = []
        for path in paths:
            p = {}
            in_port = first_port
            for s1, s2 in zip(path[:-1], path[1:]):
                out_port = self.adjacency[s1][s2]
                p[s1] = (in_port, out_port)
                in_port = self.adjacency[s2][s1]
            p[path[-1]] = (in_port, last_port)
            paths_p.append(p)
        return paths_p

    def generate_openflow_gid(self):
        '''
        Returns a random OpenFlow group id
        '''
        n = random.randint(0, 2 ** 32)
        while n in self.group_ids:
            n = random.randint(0, 2 ** 32)
        return n

    def install_paths(self, src, first_port, dst, last_port, ip_src, ip_dst):
        #computation_start = time.time()
        paths = self.get_optimal_paths(src, dst)
        pw = []
        for path in paths:
            pw.append(self.get_path_cost(path))
            print(path, "cost = ", pw[len(pw) - 1])
        sum_of_pw = sum(pw) * 1.0
        paths_with_ports = self.add_ports_to_paths(paths, first_port, last_port)
        switches_in_paths = set().union(*paths)

        for node in switches_in_paths:

            dp = self.datapath_list[node]
            ofp = dp.ofproto
            ofp_parser = dp.ofproto_parser
            #print(dp.id)

            ports = defaultdict(list)
            actions = []
            i = 0

            for path in paths_with_ports:
                if node in path:
                    in_port = path[node][0]
                    out_port = path[node][1]
                    if (out_port, pw[i]) not in ports[in_port]:
                        ports[in_port].append((out_port, pw[i]))
                i += 1

            for in_port in ports:

                match_ip = ofp_parser.OFPMatch(
                    eth_type=0x0800,
                    ipv4_src=ip_src,
                    ipv4_dst=ip_dst
                )
                match_arp = ofp_parser.OFPMatch(
                    eth_type=0x0806,
                    arp_spa=ip_src,
                    arp_tpa=ip_dst
                )

                out_ports = ports[in_port]

                if len(out_ports) > 1:
                    group_id = None
                    group_new = False

                    if (node, src, dst) not in self.multipath_group_ids:
                        group_new = True
                        self.multipath_group_ids[node, src, dst] = [self.generate_openflow_gid(), src, first_port, dst,
                                                                    last_port, ip_src, ip_dst, out_ports]
                    group_id = self.multipath_group_ids[node, src, dst][0]

                    buckets = []
                    #print ("node at ",node," out ports : ",out_ports)
                    for port, weight in out_ports:
                        bucket_weight = 7
                        bucket_action = [ofp_parser.OFPActionOutput(port)]
                        print(bucket_action)

                        buckets.append(
                            ofp_parser.OFPBucket(
                                weight=bucket_weight,
                                watch_port=port,
                                watch_group=ofp.OFPG_ANY,
                                actions=bucket_action
                            )
                        )

                    if group_new:
                        req = ofp_parser.OFPGroupMod(
                            dp, ofp.OFPGC_ADD, ofp.OFPGT_SELECT, group_id,
                            buckets
                        )
                        dp.send_msg(req)
                    else:
                        req = ofp_parser.OFPGroupMod(
                            dp, ofp.OFPGC_MODIFY, ofp.OFPGT_SELECT,
                            group_id, buckets)
                        dp.send_msg(req)

                    actions = [ofp_parser.OFPActionGroup(group_id)]

                    self.add_flow_meter(dp, 2, match_ip, actions, 0, 0)
                    self.add_flow(dp, 2, match_arp, actions, 0, 0)

                elif len(out_ports) == 1:
                    actions = [ofp_parser.OFPActionOutput(out_ports[0][0])]

                    self.add_flow_meter(dp, 1, match_ip, actions, 0, 0)
                    self.add_flow(dp, 1, match_arp, actions, 0, 0)
        #print("Path installation finished in", (time.time() - computation_start) * 1000, "milliseconds")

        return paths_with_ports[0][src][1]

    def add_flow(self, datapath, priority, match, actions, table_id, cookie, buffer_id=None):
        # print "Adding flow ", match, actions
        ofproto = datapath.ofproto
        parser = datapath.ofproto_parser

        inst = [parser.OFPInstructionActions(ofproto.OFPIT_APPLY_ACTIONS,
                                             actions)]
        if buffer_id:
            mod = parser.OFPFlowMod(datapath=datapath, buffer_id=buffer_id,
                                    priority=priority, match=match,
                                    instructions=inst, table_id=table_id, cookie=cookie)
        else:
            mod = parser.OFPFlowMod(datapath=datapath, priority=priority,
                                    match=match, instructions=inst, table_id=table_id, cookie=cookie)

        datapath.send_msg(mod)

    def add_flow_meter(self, datapath, priority, match, actions, table_id, cookie, buffer_id=None):
        # print "Adding flow ", match, actions
        ofproto = datapath.ofproto
        parser = datapath.ofproto_parser

        inst = [parser.OFPInstructionActions(ofproto.OFPIT_APPLY_ACTIONS,
                                             actions), parser.OFPInstructionMeter(datapath.id)]
        if buffer_id:
            mod = parser.OFPFlowMod(datapath=datapath, buffer_id=buffer_id,
                                    priority=priority, match=match,
                                    instructions=inst, table_id=table_id, cookie=cookie)
        else:
            mod = parser.OFPFlowMod(datapath=datapath, priority=priority,
                                    match=match, instructions=inst, table_id=table_id, cookie=cookie)
        datapath.send_msg(mod)

    @set_ev_cls(ofp_event.EventOFPSwitchFeatures, CONFIG_DISPATCHER)
    def _switch_features_handler(self, ev):
        print("switch_features_handler is called")
        datapath = ev.msg.datapath
        ofproto = datapath.ofproto
        parser = datapath.ofproto_parser

        match = parser.OFPMatch()
        actions = [parser.OFPActionOutput(ofproto.OFPP_CONTROLLER,
                                          ofproto.OFPCML_NO_BUFFER)]
        self.add_flow(datapath, 0, match, actions, 0, 0)

    @set_ev_cls(ofp_event.EventOFPPortDescStatsReply, MAIN_DISPATCHER)
    def port_desc_stats_reply_handler(self, ev):
        switch = ev.msg.datapath
        for p in ev.msg.body:
            self.bandwidths[switch.id][p.port_no] = p.curr_speed

    @set_ev_cls(ofp_event.EventOFPPacketIn, MAIN_DISPATCHER)
    def _packet_in_handler(self, ev):
        msg = ev.msg
        datapath = msg.datapath
        ofproto = datapath.ofproto
        parser = datapath.ofproto_parser
        in_port = msg.match['in_port']

        if datapath.id not in self.meter_installed:
            self.meter_installed[datapath.id] = False

            # Install meter_mod only if it has not been installed before for this switch
            meter_mod = parser.OFPMeterMod(
                datapath=datapath,
                command=ofproto.OFPFC_ADD,
                flags=ofproto.OFPMF_KBPS,
                meter_id=datapath.id,
                bands=[parser.OFPMeterBandDrop(rate=self.rate_limit)])
            datapath.send_msg(meter_mod)

        pkt = packet.Packet(msg.data)
        eth = pkt.get_protocol(ethernet.ethernet)
        arp_pkt = pkt.get_protocol(arp.arp)

        # avoid broadcast from LLDP
        if eth.ethertype == 35020:
            return

        if pkt.get_protocol(ipv6.ipv6):  # Drop the IPV6 Packets.
            match = parser.OFPMatch(eth_type=eth.ethertype)
            actions = []
            self.add_flow(datapath, 1, match, actions, 0, 0)
            return None

        dst = eth.dst
        src = eth.src
        dpid = datapath.id

        if src not in self.hosts:
            self.hosts[src] = (dpid, in_port)

        out_port = ofproto.OFPP_FLOOD

        if arp_pkt:
            #print (dpid, pkt)
            src_ip = arp_pkt.src_ip
            dst_ip = arp_pkt.dst_ip
            if arp_pkt.opcode == arp.ARP_REPLY:
                self.arp_table[src_ip] = src
                h1 = self.hosts[src]
                h2 = self.hosts[dst]
                print("sr rep", src_ip)
                print("dst rep", dst_ip)
                out_port = self.install_paths(h1[0], h1[1], h2[0], h2[1], src_ip, dst_ip)
                self.install_paths(h2[0], h2[1], h1[0], h1[1], dst_ip, src_ip)  # reverse
            elif arp_pkt.opcode == arp.ARP_REQUEST:
                if dst_ip in self.arp_table:
                    self.arp_table[src_ip] = src
                    dst_mac = self.arp_table[dst_ip]
                    h1 = self.hosts[src]
                    h2 = self.hosts[dst_mac]
                    print("sr req", src_ip)
                    print("dst req", dst_ip)
                    out_port = self.install_paths(h1[0], h1[1], h2[0], h2[1], src_ip, dst_ip)
                    self.install_paths(h2[0], h2[1], h1[0], h1[1], dst_ip, src_ip)  # reverse

        # print pkt
        #print ("hosts:", self.hosts)

        actions = [parser.OFPActionOutput(out_port)]

        data = None
        if msg.buffer_id == ofproto.OFP_NO_BUFFER:
            data = msg.data

        out = parser.OFPPacketOut(
            datapath=datapath, buffer_id=msg.buffer_id, in_port=in_port,
            actions=actions, data=data)
        datapath.send_msg(out)

    @set_ev_cls(event.EventSwitchEnter)
    def switch_enter_handler(self, ev):
        switch = ev.switch.dp
        ofp_parser = switch.ofproto_parser

        if switch.id not in self.switches:
            self.switches.append(switch.id)
            self.datapath_list[switch.id] = switch

            # Request port/link descriptions, useful for obtaining bandwidth
            req = ofp_parser.OFPPortDescStatsRequest(switch)
            switch.send_msg(req)
            print(len(switch.ports) - 1)
            self.add_ports(switch)

    @set_ev_cls(event.EventSwitchLeave, MAIN_DISPATCHER)
    def switch_leave_handler(self, ev):
        print(ev)
        switch = ev.switch.dp.id
        if switch in self.switches:
            self.switches.remove(switch)
            del self.datapath_list[switch]
            del self.adjacency[switch]

    @set_ev_cls(event.EventLinkAdd, MAIN_DISPATCHER)
    def link_add_handler(self, ev):
        s1 = ev.link.src
        s2 = ev.link.dst
        self.adjacency[s1.dpid][s2.dpid] = s1.port_no
        self.adjacency[s2.dpid][s1.dpid] = s2.port_no

    @set_ev_cls(event.EventLinkDelete, MAIN_DISPATCHER)
    def link_delete_handler(self, ev):
        s1 = ev.link.src
        s2 = ev.link.dst
        # Exception handling if switch already deleted
        try:
            del self.adjacency[s1.dpid][s2.dpid]
            del self.adjacency[s2.dpid][s1.dpid]
        except KeyError:
            pass
