// import {IntentMessageDTO} from "../types";
// import {sendMessage} from "../services/api.ts";
//
// export const handleSendMessage = (token: string, pendingMessage: IntentMessageDTO) => {
//     if (!token) {
//         console.error('No token found, generating one...');
//         return;
//     }
//
//     if (pendingMessage === null) {
//         return;
//     }
//
//     try {
//         // Send message to the server
//         sendMessage(token, pendingMessage).then(r => )
//     } catch (error) {
//         console.error('Error sending message:', error);
//         // Handle error, e.g., retry mechanism
//     }
// };