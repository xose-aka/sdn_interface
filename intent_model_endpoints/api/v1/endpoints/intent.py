import time
from datetime import datetime
from json import JSONDecodeError
from fastapi import Depends, HTTPException
from fastapi import APIRouter
from httpx import HTTPStatusError, RequestError
from starlette.responses import JSONResponse
from cache.general import cache_topology_nodes_and_ip_addresses

from api.v1.dependencies import verify_token
from exceptions.intent_format_exception import IntentFormatException
from exceptions.intent_goal_service_not_available_exception import IntentGoalServiceNotAvailableException
from schemas.chat import ConfirmConversation, IntentMessageRequest
from services.intent_process import prompt_router
from services.ryu import check_intent_nodes, prepare_ryu_url_and_request_data, check_intent_ips, \
    check_intent_node_ports, check_if_node_dpid_exists
from utils.request import request_post_external_data

router = APIRouter()

# Store chat messages with unique IDs
chat_messages = {}

# Store chat messages history with unique IDs
chat_response_history = []

# conversations those processed by langchain
encoded_conversations = {}


@router.post("/verify")
async def verify(request: IntentMessageRequest, token: str = Depends(verify_token)):
    intent_verify_start = time.time()
    fix_prompt = ""

    conversation_id = request.conversationId

    if encoded_conversations.get(conversation_id) is None:
        intent = request.intent
    else:

        conversation_data = encoded_conversations[conversation_id]
        processed_intent = conversation_data["processed_intent"]

        fix_intent = request.intent

        processed_intent = str(processed_intent).replace("'", '"')

        fix_prompt = ("""[FIXES]:Before you have generated this network configuration:"""
                      + processed_intent
                      + "The user specify some fixes:" + fix_intent)

        intent = processed_intent

    try:
        chain = prompt_router(intent, fix_prompt)

        processed_intent = chain.invoke(intent)

        encoded_conversations[conversation_id] = {
            "processed_intent": processed_intent,
            "intent": intent,
        }

        now = datetime.now()
        date = now.strftime("%d/%m/%Y %H:%M:%S")

        is_error = False
        error_counter = 0
        message = ""

        check_intent_node_result = check_intent_nodes(processed_intent)

        if check_intent_node_result["error"]:
            is_error = check_intent_node_result["error"]
            error_counter += 1

            message += f"{error_counter})" + check_intent_node_result["message"]

        check_intent_node_result = check_intent_ips(processed_intent)

        if check_intent_node_result["error"]:
            is_error = check_intent_node_result["error"]
            error_counter += 1

            if error_counter > 1:
                message += "\n"

            message += f"{error_counter})" + check_intent_node_result["message"]

        check_intent_node_result = check_intent_node_ports(processed_intent)

        if check_intent_node_result["error"]:
            is_error = check_intent_node_result["error"]
            error_counter += 1

            if error_counter > 1:
                message += "\n"

            message += f"{error_counter})" + check_intent_node_result["message"]

        check_intent_node_result = check_if_node_dpid_exists(processed_intent)

        if check_intent_node_result["error"]:
            is_error = check_intent_node_result["error"]
            error_counter += 1

            if error_counter > 1:
                message += "\n"

            message += f"{error_counter})" + check_intent_node_result["message"]

        if is_error is False:
            message = str(processed_intent).replace("'", "\"")

        end = time.time()
        print(f"Intent process took {end-intent_verify_start} seconds")

        return {
            "error": is_error,
            "data": {
                "intentId": request.intentId,  # Generate unique ID for server message
                "message": message,
                "sender": "server",
                "conversationId": conversation_id,
                "responseMessageId": request.responseMessageId,
                "timestamp": date
            }
        }
    except IntentGoalServiceNotAvailableException as e:
        return JSONResponse(content={"message": e.detail}, status_code=e.status_code)
    except JSONDecodeError as e:
        return JSONResponse(content={"message": str(e)}, status_code=500)


@router.post('/conversation/confirm')
async def confirm(confirm_conversation: ConfirmConversation, token: str = Depends(verify_token)):
    start = time.time()
    conversation_id = confirm_conversation.conversationId

    encoded_conversation = encoded_conversations.get(confirm_conversation.conversationId)

    now = datetime.now()

    if encoded_conversation is None:
        return JSONResponse(content={"message": "Encoded conversation not found"}, status_code=404)
    else:
        processed_intent = encoded_conversation["processed_intent"]

        try:
            data = prepare_ryu_url_and_request_data(processed_intent)

            url = data["url"]
            req_data = data["data"]

            node_id = processed_intent.get("node_id")
            node_id_without_space = str(node_id).replace(" ", "")

            processed_intent = str(processed_intent).replace("'", "\"")

            req_result = await request_post_external_data(url, req_data)

            print(f"req_result: {req_result}")

            if req_result["success"]:

                print(f"success: {node_id}")

                new_processed_intent = {
                    "intent": processed_intent,
                    "date": datetime.now().strftime("%d/%m/%Y %H:%M:%S")
                }

                if node_id_without_space in cache_topology_nodes_and_ip_addresses['nodes_intents']:
                    cache_topology_nodes_and_ip_addresses['nodes_intents'][node_id_without_space].append(new_processed_intent)
                else:
                    cache_topology_nodes_and_ip_addresses['nodes_intents'][node_id_without_space] = [new_processed_intent]

                end = time.time()
                print(f"Intent applied time {end-start} seconds")
                return {
                    "error": 0,
                    "data": {
                        "message": processed_intent,
                        "conversationId": conversation_id,
                        "nodeId": node_id_without_space,
                        "timestamp": now.strftime("%d-%m-%Y %H:%M:%S")
                    }
                }
            else:
                return {
                    "error": 1,
                    "data": {
                        "message": req_result["error"],
                        "conversationId": conversation_id,
                        "nodeId": node_id_without_space,
                        "timestamp": now.strftime("%d-%m-%Y %H:%M:%S")
                    }
                }

        except (IntentFormatException, IntentGoalServiceNotAvailableException) as e:
            return JSONResponse(content={"message": e.detail}, status_code=e.status_code)
        except (HTTPStatusError, RequestError, HTTPException) as e:
            print(str(e))
            return JSONResponse(content={"messages": str(e.detail)}, status_code=e.status_code)
