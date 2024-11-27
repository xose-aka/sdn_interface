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
from services.ryu import prompt_router, make_request, prepare_ryu_url_and_request_data
from utils.request import request_post_external_data

router = APIRouter()

# Store chat messages with unique IDs
chat_messages = {}

# Store chat messages history with unique IDs
chat_response_history = []

# conversations those processed by langchain
encoded_conversations = {}


@router.post("/verify", response_model=IntentMessageRequest)
async def verify(message: IntentMessageRequest, token: str = Depends(verify_token)):
    fix_prompt = ""

    conversation_id = message.conversationId

    if encoded_conversations.get(conversation_id) is None:

        intent = message.intent

        print("1")

        try:

            chain = prompt_router(intent, fix_prompt)

            result = chain.invoke(intent)

            encoded_conversations[conversation_id] = {
                "processed_intent": result,
                "intent": intent,
            }

            return {
                "intentId": message.intentId,  # Generate unique ID for server message
                "intent": str(result),
                "sender": "server",
                "conversationId": conversation_id,
                "responseMessageId": message.responseMessageId,
                "timestamp": datetime.now()
            }

        except JSONDecodeError as e:
            return JSONResponse(content={"message": str(e)}, status_code=500)

    else:
        print("2")

        conversation_data = encoded_conversations[conversation_id]
        intent = conversation_data["intent"]
        result = conversation_data["processed_intent"]

        fix_intent = message.intent

        # valid_json = pyjson5.loads(result)

        fix_prompt = ("""[FIXES]:Before you have generated this network configuration:"""
                      + str(result).replace("'", '"')
                      # + str(valid_json)
                      + "The user specify some fixes:" + fix_intent)

        try:
            chain = prompt_router(intent, fix_prompt)

            result = chain.invoke(intent)

            print("result: ", str(result))

            return {
                "intentId": message.intentId,  # Generate unique ID for server message
                "intent": str(result),
                "sender": "server",
                "conversationId": conversation_id,
                "responseMessageId": message.responseMessageId,
                "timestamp": datetime.now()
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
