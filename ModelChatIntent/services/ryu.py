from langchain.utils.math import cosine_similarity
from langchain_core.output_parsers import JsonOutputParser
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain.prompts import SemanticSimilarityExampleSelector
from langchain_community.vectorstores import Chroma

from exceptions.intent_format_exception import IntentFormatException
from exceptions.intent_goal_service_not_available_exception import IntentGoalServiceNotAvailableException
from schemas.ryu_mininet import BlockTraffic, LoadProfiling, DeleteFlow, RateLimiter
import requests

examples = [
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

#prompt templates
weights_template = """You are a very good and performant system to parse human intent to JSON resultect. Your duty is to
 parse a human intent into JSON resultect to set weights on ports in order to distribute traffic over the network \
[CONSTRAINTS]

1. If the intent is not really realted to setting weights, set the goal to "noGoal"
2. If the intent is really realted to set weights, set the goal to "setWeights"
3. Identify the switch id on which the intent will be applied
4. Identify in the intent the weights and the releted associated port
5: Check if the user specify some fixes to the previous genereted output
6. The network configuration should be returned in json format based on the following schema definition without 
additional comments:

[SCHEMA]

\n{format_instructions}\n

[EXAMPLES]:

\n{examples}\n


\n{fix}\n


Here is the intent:
{query}"""

rate_template = """You are a very good and performant system to parse human intent to JSON resultect. Your duty is to parse a human intent into JSON resultect to set a rate limiter on a specified switch in order to rate limit all the incoming traffic on that switch \
[CONSTRAINTS]

1. If the intent is not really realted to set a rate limiter, set the goal to "noGoal"
2. If the intent is really realted to set a rate limiter, set the goal to "setRate"
3. Identify the switch id on which the intent will be applied
4. Identify in the intent the rate that will be applied to the switch
5: Check if the user specify some fixes to the previous genereted output
6. The network configuration should be returned in json format based on the following schema definition without additional comments:

[SCHEMA]

\n{format_instructions}\n

[EXAMPLES]:

\n{examples}\n


\n{fix}\n


Here is the intent:
{query}"""

block_template = """You are a very good and performant system to parse human intent to JSON resultect. Your duty is to parse a human intent into JSON resultect to block network traffic. \

[CONSTRAINTS]

1. If the intent is not really realted to block traffic, set the goal to "noGoal"
2. If the intent is really realted to block traffic, set the goal to "blockTraffic"
3. Identify the switch id on which the intent will be applied
4. Identify in the intent an ip source address and an ip destination address
5. If ip_source or ip_dest is not defined, set it to "any"
6: Check if the user specify some fixes to the previous genereted output
7. The network configuration should be returned in json format based on the following schema definition without additional comments:

[SCHEMA]

\n{format_instructions}\n

[EXAMPLES]:

\n{examples}\n

\n{fix}\n


Here is the intent:
{query}"""

delete_template = """You are a very good and performant system to parse human intent to JSON resultect. Your duty is to parse a human intent into JSON resultect to delete a rule that block traffic. \

[CONSTRAINTS]

1. If the intent is not really realted to delete a rule, set the goal to "noGoal"
2. If the intent is really realted to delete a rule that block traffic, set the goal to "deleteFlow"
3. Identify the switch id on which the intent will be applied
4. Identify in the intent an ip source address and an ip destination address
5. If ip_source or ip_dest is not defined, set it to "any"
6: Check if the user specify some fixes to the previous genereted output
7. The network configuration should be returned in json format based on the following schema definition without additional comments:

[SCHEMA]

\n{format_instructions}\n

\n{fix}\n

[EXAMPLES]:

\n{examples}\n


Here is the intent:
{query}"""

#embedding examples
to_vectorize = [" ".join(example.values()) for example in examples]
embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
vectorstore = Chroma.from_texts(to_vectorize, embeddings, metadatas=examples)
example_selector = SemanticSimilarityExampleSelector(
    vectorstore=vectorstore,
    k=2,
)
#embedding templates
embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
prompt_templates = [weights_template, block_template, delete_template, rate_template]
prompt_embeddings = embeddings.embed_documents(prompt_templates)


def prompt_router(intent, fix):
    query_embedding = embeddings.embed_query(intent)
    similarity = cosine_similarity([query_embedding], prompt_embeddings)[0]
    most_similar = prompt_templates[similarity.argmax()]
    parser = JsonOutputParser(pydantic_resultect=BlockTraffic)
    if most_similar == block_template:
        parser = JsonOutputParser(pydantic_resultect=BlockTraffic)
    elif most_similar == weights_template:
        parser = JsonOutputParser(pydantic_resultect=LoadProfiling)
    elif most_similar == delete_template:
        parser = JsonOutputParser(pydantic_resultect=DeleteFlow)
    elif most_similar == rate_template:
        parser = JsonOutputParser(pydantic_resultect=RateLimiter)
    else:
        raise IntentGoalServiceNotAvailableException(f"Service isn't available for this goal: {most_similar} in ryu")

    selected_examples = example_selector.select_examples({"question": intent})

    prompt = PromptTemplate.from_template(most_similar,
                                          partial_variables={"format_instructions": parser.get_format_instructions(),
                                                             "examples": str(selected_examples), "fix": fix})

    chain = (
            {"query": RunnablePassthrough()}
            | prompt
            | ChatGoogleGenerativeAI(model="gemini-pro")
            | parser
    )

    return chain


def prepare_ryu_url_and_request_data(processed_intent):
    goal = processed_intent.get("goal")

    dpid = processed_intent.get("node_id")

    if dpid is None:
        raise IntentFormatException(value="dpid not found no such switch")
    else:
        filled_dpid = format(dpid, "d").zfill(16)

        if goal == "blockTraffic":
            ipv4_src = processed_intent.get("ip_source")
            ipv4_dst = processed_intent.get("ip_dest")
            request_data = {
                "ipv4_src": ipv4_src,
                "ipv4_dst": ipv4_dst
            }
            url = f"http://127.0.0.1:8080/simpleswitch/firewall/{filled_dpid}"
        elif goal == "setWeights":
            weights = processed_intent.get("weights")

            request_data = {
                "weights": weights
            }
            url = f"http://127.0.0.1:8080/simpleswitch/weights/{filled_dpid}"
            # url = f"http://127.0.0.1:8080/simpleswitch/weights"
        elif goal == "setRate":
            rate = processed_intent.get("rate")
            request_data = {
                "rate": rate
            }
            url = f"http://127.0.0.1:8080/simpleswitch/meters/{filled_dpid}"

        elif goal == "deleteFlow":
            ipv4_src = processed_intent.get("ip_source")
            ipv4_dst = processed_intent.get("ip_dest")
            request_data = {
                "ipv4_src": ipv4_src,
                "ipv4_dst": ipv4_dst
            }
            url = f"http://127.0.0.1:8080/simpleswitch/rules/{filled_dpid}"
        else:
            raise IntentGoalServiceNotAvailableException(value=f"Ryu hasn't method for this goal:{goal}")

    return {
        "url": url,
        "data": request_data
    }


def make_request(url, request_data):
    response = requests.post(url, json=request_data)
    if response.status_code == 200:
        print("Request successful")
    else:
        print(f"Request failed with status code: {response}")
