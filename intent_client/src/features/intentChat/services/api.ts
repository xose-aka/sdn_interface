import {IntentMessageDTO} from "../types";
import {API_CONFIG} from "../../../config/api.ts";
import axios from "axios";

export const sendMessage = async (token: string, intentMessageDTO: IntentMessageDTO): Promise<any> => {
    const response = await axios.post<IntentMessageDTO>(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MESSAGE_VERIFY}`,
        intentMessageDTO,
        { headers: { 'X-Token': token } }
    )

    return response.data
}

export const sendConfirmConversation = async (token: string, conversationId: string) => {
    const response = await axios.post(
            `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MESSAGE_CONFIRM}`,
            {conversationId: conversationId},
            { headers: { 'X-Token': token } }
        )

    return response.data
};