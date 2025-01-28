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

        try:
            new_entry = req.json if req.body else {}
        except ValueError:
            return Response(status="400 Bad Request")

        try:
            simple_switch.block_ip_traffic(dpid, new_entry)
        except Exception as e:
            print(f"Error: {e}")
            return Response(status="500 Internal Server Error", text=str(e))

    @route('simpleswitch', '/simpleswitch/rules/{dpid}', methods=['POST'], requirements={'dpid': dpid_lib.DPID_PATTERN})
    def delete_flow(self, req, **kwargs):
        simple_switch = self.simple_switch_app
        dpid = dpid_lib.str_to_dpid(kwargs['dpid'])

        try:
            new_entry = req.json if req.body else {}
        except ValueError:
            return Response(status="400 Bad Request")

        try:
            simple_switch.remove_flow(dpid, new_entry, 1)
            print("remove flow has done")

        except Exception as e:
            print(f'Exception" {str(e)}')
            return Response(status="500 Internal Server Error", body=str(e))

    @route('simpleswitch', '/simpleswitch/weights/{dpid}', methods=['POST'],
           requirements={'dpid': dpid_lib.DPID_PATTERN})
    def set_port_weights(self, req, **kwargs):
        print("here")
        simple_switch = self.simple_switch_app
        dpid = dpid_lib.str_to_dpid(kwargs['dpid'])
        try:
            new_entry = req.json if req.body else {}
        except ValueError:
            return Response(status="400 Bad Request")

        weights = new_entry['weights']

        try:
            simple_switch.set_weights(dpid, weights)

        except Exception as e:
            print("Errore:", e)
            return Response(status="500 Internal Server Error", body=str(e))

    @route('simpleswitch', '/simpleswitch/meters/{dpid}', methods=['POST'],
           requirements={'dpid': dpid_lib.DPID_PATTERN})
    def set_port_meters(self, req, **kwargs):
        simple_switch = self.simple_switch_app
        dpid = dpid_lib.str_to_dpid(kwargs['dpid'])
        try:
            new_entry = req.json if req.body else {}
        except ValueError:
            return Response(status="400 Bad Request")

        rate = new_entry['rate']

        rate = int(rate)

        print("rate: ", type(rate))

        try:
            simple_switch.set_rate(dpid, rate)

        except Exception as e:
            print("Errore:", e)
            return Response(status="500 Internal Server Error", body=str(e))

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
