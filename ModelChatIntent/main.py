from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from typing import List

app = FastAPI()

# List to store active connections
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

@app.websocket("/ws/chat")
async def chat_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            bot_response = generate_bot_response(data)
            await manager.broadcast(f"User: {data}")
            await manager.broadcast(f"Bot: {bot_response}")
    except WebSocketDisconnect:
        manager.disconnect(websocket)

def generate_bot_response(user_message):
    # Here you can integrate AI or any static response generation logic
    if "hello" in user_message.lower():
        return "Hello! How can I help you today?"
    return "I'm not sure I understand that."


@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.post("/send-intent")
async def send_intent():
    return {"message": "Hello World"}


@app.get("/hello/{name}")
async def say_hello(name: str):
    return {"message": f"Hello {name}"}
