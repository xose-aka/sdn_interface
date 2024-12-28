from datetime import datetime
from json import JSONDecodeError
from fastapi import Depends, HTTPException
from fastapi import APIRouter
from httpx import HTTPStatusError, RequestError
from starlette.responses import JSONResponse

from api.v1.dependencies import verify_token
from exceptions.intent_format_exception import IntentFormatException
from exceptions.intent_goal_service_not_available_exception import IntentGoalServiceNotAvailableException
from schemas.chat import ConfirmConversation, IntentMessageRequest
from services.intent_process import prompt_router
from services.ryu import check_intent_nodes, prepare_ryu_url_and_request_data, check_intent_ips
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
    fix_prompt = ""

    conversation_id = request.conversationId

    if encoded_conversations.get(conversation_id) is None:
        intent = request.intent
    else:

        conversation_data = encoded_conversations[conversation_id]
        intent = conversation_data["intent"]
        processed_intent = conversation_data["processed_intent"]

        fix_intent = request.intent

        fix_prompt = ("""[FIXES]:Before you have generated this network configuration:"""
                      + str(processed_intent).replace("'", '"')
                      + "The user specify some fixes:" + fix_intent)

        intent = str(processed_intent)

    try:
        chain = prompt_router(intent, fix_prompt)

        processed_intent = chain.invoke(intent)
        print("new intent ", str(processed_intent))

        encoded_conversations[conversation_id] = {
            "processed_intent": processed_intent,
            "intent": intent,
        }

        check_intent_node_result = check_intent_nodes(processed_intent)

        if check_intent_node_result["error"]:
            return {
                "error": check_intent_node_result["error"],
                "data": {
                    "intentId": request.intentId,  # Generate unique ID for server message
                    "message": check_intent_node_result["message"],
                    "sender": "server",
                    "conversationId": conversation_id,
                    "responseMessageId": request.responseMessageId,
                    "timestamp": datetime.now()
                }
            }

        check_intent_node_result = check_intent_ips(processed_intent)

        if check_intent_node_result["error"]:
            return {
                "error": check_intent_node_result["error"],
                "data": {
                    "intentId": request.intentId,  # Generate unique ID for server message
                    "message": check_intent_node_result["message"],
                    "sender": "server",
                    "conversationId": conversation_id,
                    "responseMessageId": request.responseMessageId,
                    "timestamp": datetime.now()
                }
            }

        return {
            "error": check_intent_node_result["error"],
            "data": {
                "intentId": request.intentId,  # Generate unique ID for server message
                "message": str(processed_intent).replace("'", "\""),
                "sender": "server",
                "conversationId": conversation_id,
                "responseMessageId": request.responseMessageId,
                "timestamp": datetime.now()
            }
        }
    except IntentGoalServiceNotAvailableException as e:
        return JSONResponse(content={"message": e.detail}, status_code=e.status_code)
    except JSONDecodeError as e:
        return JSONResponse(content={"message": str(e)}, status_code=500)


@router.post('/conversation/confirm')
async def confirm(confirm_conversation: ConfirmConversation, token: str = Depends(verify_token)):
    encoded_conversation = encoded_conversations.get(confirm_conversation.conversationId)

    if encoded_conversation is None:
        return JSONResponse(content={"message": "Encoded conversation not found"}, status_code=404)
    else:
        processed_intent = encoded_conversation["processed_intent"]

        try:
            data = prepare_ryu_url_and_request_data(processed_intent)

            url = data["url"]
            req_data = data["data"]

            req_result = await request_post_external_data(url, req_data)

            response = "Success"

            if req_result is not None:
                response = req_result

            return {
                "message": str(response)
            }
        except (IntentFormatException, IntentGoalServiceNotAvailableException) as e:
            return JSONResponse(content={"message": e.detail}, status_code=e.status_code)
        except (HTTPStatusError, RequestError, HTTPException) as e:
            print(str(e))
            return JSONResponse(content={"messages": str(e.detail)}, status_code=e.status_code)
