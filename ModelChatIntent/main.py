from datetime import datetime

from fastapi import FastAPI, Depends, HTTPException, Header
from uuid import uuid4
from fastapi.middleware.cors import CORSMiddleware

from langchain.utils.math import cosine_similarity
from langchain_core.output_parsers import JsonOutputParser
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_google_genai import ChatGoogleGenerativeAI,GoogleGenerativeAIEmbeddings
import time
from langchain.prompts import SemanticSimilarityExampleSelector
from langchain_community.vectorstores import Chroma
from langchain.globals import set_debug
import json
import requests
import os

from schemas import TokenResponse

set_debug(True)

os.environ['GOOGLE_API_KEY'] = 'AIzaSyDIYm_-MdLqK3lFlTj0qF9nudXavXtp_zA'

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this to specify allowed origins
    allow_credentials=True,
    allow_methods=["*"],  # Adjust this to specify allowed HTTP methods
    allow_headers=["*"],  # Adjust this to specify allowed headers
)

# In-memory store for demo purposes
user_tokens = {}

# Store chat messages with unique IDs
chat_messages = {}

# Store chat messages history with unique IDs
chat_response_history = []

examples = [
    {
        "question": "block traffic from 10.0.0.1 to 10.0.0.2 on switch 2",
        "answer": """{
      "goal": "blockTraffic",
      "switch_id": 2,
      "ip_source": "10.0.0.1",
      "ip_dest": "10.0.0.2"
    }"""
    },
    {
        "question": "on switch 3 set the weights 0.2 on port 3, 0.3 on port 2, 0.5 on port 1",
        "answer": """{
      "goal": "setWeights",
      "switch_id": 3,
      "weights": {3:0.2,2:0.3,1:0.5}
    }"""
    },
    {
        "question": "delete the rule that block traffic to 10.0.0.1 on switch 1",
        "answer": """{
      "goal": "deleteFlow",
      "switch_id": 1,
      "ip_source": "any",
      "ip_dest": "10.0.0.1"
    }"""
    },
    {
        "question": "block traffic from 10.1.1.1 to 10.1.1.2 on switch 4",
        "answer": """{
      "goal": "blockTraffic",
      "switch_id": 4,
      "ip_source": "10.1.1.1",
      "ip_dest": "10.1.1.2"
    }"""
    },
    {
        "question": "on switch 2 set the weights 0.1 on port 1, 0.4 on port 2, 0.5 on port 3",
        "answer": """{
      "goal": "setWeights",
      "switch_id": 2,
      "weights": {1:0.1,2:0.4,3:0.5}
    }"""
    },
    {
        "question": "delete the rule that blocks traffic to 10.2.2.2 on switch 3",
        "answer": """{
      "goal": "deleteFlow",
      "switch_id": 3,
      "ip_source": "any",
      "ip_dest": "10.2.2.2"
    }"""
    },
    {
        "question": "block traffic from 192.168.1.1 to 192.168.1.2 on switch 1",
        "answer": """{
      "goal": "blockTraffic",
      "switch_id": 1,
      "ip_source": "192.168.1.1",
      "ip_dest": "192.168.1.2"
    }"""
    },
    {
        "question": "on switch 4 set the weights 0.3 on port 1, 0.2 on port 2, 0.5 on port 3",
        "answer": """{
      "goal": "setWeights",
      "switch_id": 4,
      "weights": {1:0.3,2:0.2,3:0.5}
    }"""
    },
    {
        "question": "delete the rule that blocks traffic to 10.3.3.3 on switch 2",
        "answer": """{
      "goal": "deleteFlow",
      "switch_id": 2,
      "ip_source": "any",
      "ip_dest": "10.3.3.3"
    }"""
    },
    {
        "question": "block traffic from 172.16.0.1 to 172.16.0.2 on switch 3",
        "answer": """{
      "goal": "blockTraffic",
      "switch_id": 3,
      "ip_source": "172.16.0.1",
      "ip_dest": "172.16.0.2"
    }"""
    },
    {
        "question": "on switch 1 set the weights 0.4 on port 1, 0.4 on port 2, 0.2 on port 3",
        "answer": """{
      "goal": "setWeights",
      "switch_id": 1,
      "weights": {3:0.2,2:0.3,1:0.5}
    }"""
    },
    {
        "question": "delete the rule that blocks traffic to 10.4.4.4 on switch 4",
        "answer": """{
      "goal": "deleteFlow",
      "switch_id": 4,
      "ip_source": "any",
      "ip_dest": "10.4.4.4"
    }"""
    },
    {
        "question": "block traffic from 10.5.5.5 to 10.5.5.6 on switch 2",
        "answer": """{
      "goal": "blockTraffic",
      "switch_id": 2,
      "ip_source": "10.5.5.5",
      "ip_dest": "10.5.5.6"
    }"""
    }
]

#prompt templates
weights_template = """You are a very good and performant system to parse human intent to JSON resultect. Your duty is to parse a human intent into JSON resultect to set weights on ports in order to distribute traffic over the network \
[CONSTRAINTS]

1. If the intent is not really realted to setting weights, set the goal to "noGoal"
2. If the intent is really realted to set weights, set the goal to "setWeights"
3. Identify the switch id on which the intent will be applied
4. Identify in the intent the weights and the releted associated port
5: Check if the user specify some fixes to the previous genereted output
6. The network configuration should be returned in json format based on the following schema definition without additional comments:

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
prompt_templates = [weights_template, block_template,delete_template,rate_template]
prompt_embeddings = embeddings.embed_documents(prompt_templates)

# Endpoint to generate a unique token for a new user
@app.get("/generate-token", response_model=TokenResponse)
async def generate_token():
    token = str(uuid4())  # Generate a unique token (UUID)
    user_tokens[token] = []  # Initialize an empty chat history for this user
    return {"token": token}

# Verify the token (simplified for demo)
async def verify_token(x_token: str = Header(...)):
    if not x_token:
        raise HTTPException(status_code=400, detail="Missing token")
    return x_token

# Chat endpoint
# @app.post("/chat", response_model=ChatResponse)
@app.post("/chat", response_model=ChatResponse)
async def chat(messages_list: MessagesList, token: str = Depends(verify_token)):
    # Store the user message in the sequence (in-memory store for demo)


    response_message = ""
    server_message_client_id = ""

    fix_prompt = ""

    for message in messages_list.items:

        if message.sender == "user":

            chat_messages[message.clientId] = {
                "clientId": message.clientId,
                "sender": message.sender,
                "text": message.text,
                "timestamp": message.timestamp
            }

            chain = prompt_router(message.text, fix_prompt)

            result = chain.invoke(message.text)

            print(result)

            goal = result.get("goal")

            dpid = result.get("switch_id")

            if dpid is None:
                response_message = "Not well formated intent"
            else:
                filled_dpid = format(dpid, "d").zfill(16)

                if goal == "blockTraffic":
                    ipv4_src = result.get("ip_source")
                    ipv4_dst = result.get("ip_dest")
                    request_data = {
                        "ipv4_src": ipv4_src,
                        "ipv4_dst": ipv4_dst
                    }
                    url = f"http://127.0.0.1:8080/simpleswitch/firewall/{filled_dpid}"
                elif goal == "setWeights":
                    weights = result.get("weights")

                    request_data = {
                        "weights": weights
                    }
                    url = f"http://127.0.0.1:8080/simpleswitch/weights/{filled_dpid}"
                elif goal == "setRate":
                    rate = result.get("rate")
                    request_data = {
                        "rate": rate
                    }
                    url = f"http://127.0.0.1:8080/simpleswitch/meters/{filled_dpid}"

                elif goal == "deleteFlowMod":
                    ipv4_src = result.get("ip_source")
                    ipv4_dst = result.get("ip_dest")
                    request_data = {
                        "ipv4_src": ipv4_src,
                        "ipv4_dst": ipv4_dst
                    }
                    url = f"http://127.0.0.1:8080/simpleswitch/rules/{filled_dpid}"
                else:
                    print("Not available service for that intent")

                make_request(url, request_data)

                response_message += message.text

        if message.sender == "server":
            server_message_client_id = message.clientId

    # Process the message and generate a server response
    server_message = {  
        "id": str(uuid4()),  # Generate unique ID for server message
        "text": f"Server response to: {response_message}",
        "clientId": server_message_client_id,
        "sender": "server",
        "timestamp": datetime.now()
    }
    chat_messages[server_message["id"]] = server_message
    chat_response_history.append(server_message)

    print("Values ", server_message)

    # Return the response to the client
    return {
        "message": server_message,
        "history": [msg for msg in chat_response_history]  # Returning the full history
    }

def make_request(url, request_data):
    response = requests.post(url, json=request_data)
    if response.status_code == 200:
        print("Request successful")
    else:
        print(f"Request failed with status code: {response}")

def prompt_router(input,fix):
    query_embedding = embeddings.embed_query(input)
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

    selected_examples = example_selector.select_examples({"question": input})
    prompt = PromptTemplate.from_template(most_similar, partial_variables={"format_instructions": parser.get_format_instructions(),"examples":str(selected_examples),"fix":fix})

    chain = (
            {"query": RunnablePassthrough()}
            | prompt
            | ChatGoogleGenerativeAI(model="gemini-pro")
            | parser
    )

    return chain
