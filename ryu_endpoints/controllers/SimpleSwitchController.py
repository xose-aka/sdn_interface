from ryu.app.wsgi import ControllerBase, route
from ryu.lib import dpid as dpid_lib
import json
from webob import Response

simple_switch_instance_name = 'simple_switch_api_app'


class SimpleSwitchController(ControllerBase):

    def __init__(self, req, link, data, **config):
        super(SimpleSwitchController, self).__init__(req, link, data, **config)
        self.simple_switch_app = data[simple_switch_instance_name]

    # @route('simpleswitch', '/simpleswitch/firewall/{dpid}', methods=['POST'],requirements={'dpid':
    # dpid_lib.DPID_PATTERN})
    @route('simpleswitch', '/simpleswitch/firewall/{dpid}', methods=['POST'])
    def block_ip(self, req, **kwargs):
        simple_switch = self.simple_switch_app
        dpid = dpid_lib.str_to_dpid(kwargs['dpid'])

        print("here good")

        try:
            new_entry = req.json if req.body else {}
        except ValueError:
            raise Response(status=400)

        try:
            simple_switch.block_ip_traffic(dpid, new_entry)
            print("block_ip_traffic has done")
        except Exception as e:
            print("Errore:", str(e))
            return Response(status=500, text=str(e))

    @route('simpleswitch', '/simpleswitch/rules/{dpid}', methods=['POST'], requirements={'dpid': dpid_lib.DPID_PATTERN})
    def delete_flow(self, req, **kwargs):
        simple_switch = self.simple_switch_app
        dpid = dpid_lib.str_to_dpid(kwargs['dpid'])

        try:
            new_entry = req.json if req.body else {}
        except ValueError:
            raise Response(status=400)

        ipv4_src = None
        ipv4_dst = None

        match = None

        #extract the addres from the entry
        if 'ipv4_src' in new_entry:
            ipv4_src = new_entry['ipv4_src']
        if 'ipv4_dst' in new_entry:
            ipv4_dst = new_entry['ipv4_dst']

        dp = simple_switch.datapath_list[dpid]
        parser = dp.ofproto_parser
        try:

            if ipv4_src != "any" and ipv4_dst != "any":
                match = parser.OFPMatch(eth_type=0x0800, ipv4_src=ipv4_src, ipv4_dst=ipv4_dst)

            elif ipv4_dst != "any":

                match = parser.OFPMatch(eth_type=0x0800, ipv4_dst=ipv4_dst)


            elif ipv4_src != "any":

                match = parser.OFPMatch(eth_type=0x0800, ipv4_src=ipv4_src)

            simple_switch.remove_flow(dp, match, 1)

        except Exception as e:
            return Response(
                body=str(e),
                status=500
            )

    @route('simpleswitch', '/simpleswitch/weights/{dpid}', methods=['POST'],
           requirements={'dpid': dpid_lib.DPID_PATTERN})
    def set_port_weights(self, req, **kwargs):
        print("here")
        simple_switch = self.simple_switch_app
        dpid = dpid_lib.str_to_dpid(kwargs['dpid'])
        try:
            new_entry = req.json if req.body else {}
        except ValueError:
            raise Response(status=400)
        print("here")
        weights = new_entry['weights']
        print(weights)

        try:
            simple_switch.set_weights(dpid, weights)

        except Exception as e:
            print("Errore:", e)
            return Response(status=500)

    @route('simpleswitch', '/simpleswitch/meters/{dpid}', methods=['POST'],
           requirements={'dpid': dpid_lib.DPID_PATTERN})
    def set_port_meters(self, req, **kwargs):
        simple_switch = self.simple_switch_app
        dpid = dpid_lib.str_to_dpid(kwargs['dpid'])
        try:
            new_entry = req.json if req.body else {}
        except ValueError:
            raise Response(status=400)

        rate = new_entry['rate']

        try:
            simple_switch.set_rate(dpid, rate)

        except Exception as e:
            print("Errore:", e)
            return Response(status=500)

    @route('simpleswitch', '/simpleswitch/hosts', methods=['GET'])
    def get_ip_hosts(self, req, **kwargs):
        simple_switch = self.simple_switch_app

        try:

            hosts = simple_switch.get_hosts()
            body = json.dumps(hosts)
            print(body)

        except Exception as e:
            print("Errore:", e)

        return Response(content_type='application/json', charset='utf-8', body=body)
