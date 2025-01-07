intent_examples_and_response_structure = [
    {
        "question": "block traffic from 10.0.0.1 to 10.0.0.2 on switch 2",
        "answer": """{
          "goal": "blockTraffic",
          "node_id": "switch 2",
          "ip_source": "10.0.0.1",
          "ip_dest": "10.0.0.2"
        }"""
    },
    {
        "question": "on switch 3 set the weights 0.2 on port 3, 0.3 on port 2, 0.5 on port 1",
        "answer": """{
          "goal": "setWeights",
          "node_id": "switch 3",
          "weights": {"3":0.2,"2":0.3,"1":0.5}
        }"""
    },
    {
        "question": "delete the rule that block traffic to 10.0.0.1 on switch 1",
        "answer": """{
      "goal": "deleteFlow",
      "node_id": "switch 1",
      "ip_source": "any",
      "ip_dest": "10.0.0.1"
    }"""
    },
    {
        "question": "block traffic from 10.1.1.1 to 10.1.1.2 on switch 4",
        "answer": """{
      "goal": "blockTraffic",
      "node_id": "switch 4",
      "ip_source": "10.1.1.1",
      "ip_dest": "10.1.1.2"
    }"""
    },
    {
        "question": "on switch 2 set the weights 0.1 on port 1, 0.4 on port 2, 0.5 on port 3",
        "answer": """{
      "goal": "setWeights",
      "node_id": "switch 2",
      "weights": {"1":0.1,"2":0.4,"3":0.5}
    }"""
    },
    {
        "question": "delete the rule that blocks traffic to 10.2.2.2 on switch 3",
        "answer": """{
      "goal": "deleteFlow",
      "node_id": "switch 3",
      "ip_source": "any",
      "ip_dest": "10.2.2.2"
    }"""
    },
    {
        "question": "block traffic from 192.168.1.1 to 192.168.1.2 on switch 1",
        "answer": """{
      "goal": "blockTraffic",
      "node_id": "switch 1",
      "ip_source": "192.168.1.1",
      "ip_dest": "192.168.1.2"
    }"""
    },
    {
        "question": "on switch 4 set the weights 0.3 on port 1, 0.2 on port 2, 0.5 on port 3",
        "answer": """{
      "goal": "setWeights",
      "node_id": "switch 4",
      "weights": {"1":0.3,"2":0.2,"3":0.5}
    }"""
    },
    {
        "question": "delete the rule that blocks traffic to 10.3.3.3 on switch 2",
        "answer": """{
      "goal": "deleteFlow",
      "node_id": "switch 2",
      "ip_source": "any",
      "ip_dest": "10.3.3.3"
    }"""
    },
    {
        "question": "block traffic from 172.16.0.1 to 172.16.0.2 on switch 3",
        "answer": """{
      "goal": "blockTraffic",
      "node_id": "switch 3",
      "ip_source": "172.16.0.1",
      "ip_dest": "172.16.0.2"
    }"""
    },
    {
        "question": "on switch 1 set the weights 0.4 on port 1, 0.4 on port 2, 0.2 on port 3",
        "answer": """{
      "goal": "setWeights",
      "node_id": "switch 1",
      "weights": {"3":0.2,"2":0.3,"1":0.5}
    }"""
    },
    {
        "question": "delete the rule that blocks traffic to 10.4.4.4 on switch 4",
        "answer": """{
      "goal": "deleteFlow",
      "node_id": "switch 4",
      "ip_source": "any",
      "ip_dest": "10.4.4.4"
    }"""
    },
    {
        "question": "block traffic from 10.5.5.5 to 10.5.5.6 on switch 2",
        "answer": """{
      "goal": "blockTraffic",
      "node_id": "switch 2",
      "ip_source": "10.5.5.5",
      "ip_dest": "10.5.5.6"
    }"""
    },
    {
        "question": "block traffic from 10.5.5.5 to 10.5.5.6 on host 2",
        "answer": """{
      "goal": "blockTraffic",
      "node_id": "host 2",
      "ip_source": "10.5.5.5",
      "ip_dest": "10.5.5.6"
    }"""
    },
    {
        "question": "delete the rule that blocks traffic to 10.4.4.4 on host 4",
        "answer": """{
      "goal": "deleteFlow",
      "node_id": "host 4",
      "ip_source": "any",
      "ip_dest": "10.4.4.4"
    }"""
    },
    {
        "question": "on host 1 set the weights 0.4 on port 1, 0.4 on port 2, 0.2 on port 3",
        "answer": """{
      "goal": "setWeights",
      "node_id": "host 1",
      "weights": {"3":0.2,"2":0.3,"1":0.5}
    }"""
    },
    {
        "question": "block traffic from 10.5.5.5 to 10.5.5.6 on router 2",
        "answer": """{
      "goal": "blockTraffic",
      "node_id": "router 2",
      "ip_source": "10.5.5.5",
      "ip_dest": "10.5.5.6"
    }"""
    },
    {
        "question": "delete the rule that blocks traffic to 10.4.4.4 on router 4",
        "answer": """{
      "goal": "deleteFlow",
      "node_id": "router 4",
      "ip_source": "any",
      "ip_dest": "10.4.4.4"
    }"""
    },
    {
        "question": "on router 1 set the weights 0.4 on port 1, 0.4 on port 2, 0.2 on port 3",
        "answer": """{
      "goal": "setWeights",
      "node_id": "router 1",
      "weights": {"3":0.2,"2":0.3,"1":0.5}
    }"""
    },
]

# prompt templates
weights_template = """You are a very good and performant system to parse human intent to JSON resultect. Your duty is to
 parse a human intent into JSON resultect to set weights on ports in order to distribute traffic over the network \
[CONSTRAINTS]

1. If the intent is not really related to setting weights, set the goal to "noGoal"
2. If the intent is really related to set weights, set the goal to "setWeights"
3. Identify the switch id on which the intent will be applied
4. Identify in the intent the weights and the related associated port
5: Check if the user specify some fixes to the previous generated output
6. The network configuration should be returned in json format based on the following schema definition without 
additional comments:

[SCHEMA]

\n{format_instructions}\n

[EXAMPLES]:

\n{examples}\n


\n{fix}\n


Here is the intent:
{query}"""

rate_template = """You are a very good and performant system to parse human intent to JSON resultect. Your duty is to 
parse a human intent into JSON resultect to set a rate limiter on a specified switch in order to rate limit all the 
incoming traffic on that switch [CONSTRAINTS]

1. If the intent is not really related to set a rate limiter, set the goal to "noGoal" 2. If the intent is really 
related to set a rate limiter, set the goal to "setRate" 3. Identify the switch id on which the intent will be 
applied 4. Identify in the intent the rate that will be applied to the switch 5: Check if the user specify some fixes 
to the previous generated output 6. The network configuration should be returned in json format based on the 
following schema definition without additional comments:

[SCHEMA]

\n{format_instructions}\n

[EXAMPLES]:

\n{examples}\n


\n{fix}\n


Here is the intent:
{query}"""

block_template = """You are a very good and performant system to parse human intent to JSON resultect. Your duty is 
to parse a human intent into JSON resultect to block network traffic. \

[CONSTRAINTS]

1. If the intent is not really related to block traffic, set the goal to "noGoal" 2. If the intent is really related 
to block traffic, set the goal to "blockTraffic" 3. Identify the switch id on which the intent will be applied 4. 
Identify in the intent an ip source address and an ip destination address 5. If ip_source or ip_dest is not defined, 
set it to "any" 6: Check if the user specify some fixes to the previous generated output 7. The network configuration 
should be returned in json format based on the following schema definition without additional comments:

[SCHEMA]

\n{format_instructions}\n

[EXAMPLES]:

\n{examples}\n

\n{fix}\n


Here is the intent:
{query}"""

delete_template = """You are a very good and performant system to parse human intent to JSON resultect. Your duty is 
to parse a human intent into JSON resultect to delete a rule that block traffic. \

[CONSTRAINTS]

1. If the intent is not really related to delete a rule, set the goal to "noGoal" 2. If the intent is really related 
to delete a rule that block traffic, set the goal to "deleteFlow" 3. Identify the switch id on which the intent will 
be applied 4. Identify in the intent an ip source address and an ip destination address 5. If ip_source or ip_dest is 
not defined, set it to "any" 6: Check if the user specify some fixes to the previous generated output 7. The network 
configuration should be returned in json format based on the following schema definition without additional comments:

[SCHEMA]

\n{format_instructions}\n

\n{fix}\n

[EXAMPLES]:

\n{examples}\n


Here is the intent:
{query}"""
