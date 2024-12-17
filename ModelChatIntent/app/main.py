from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.v1.endpoints.message import router as message_endpoint
from api.v1.endpoints.auth import router as auth_endpoint
from api.v1.endpoints.topo import router as topo_endpoint

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this to specify allowed origins
    allow_credentials=True,
    allow_methods=["*"],  # Adjust this to specify allowed HTTP methods
    allow_headers=["*"],  # Adjust this to specify allowed headers
)

app.include_router(message_endpoint, prefix="/api/v1/messages")
app.include_router(topo_endpoint, prefix="/api/v1/topo")
app.include_router(auth_endpoint, prefix="/api/v1")


@app.get("/")
def root():
    return {"message": "Welcome to the app!"}


@app.get("/routes")
async def list_routes():
    routes = []
    for route in app.routes:
        routes.append({
            "path": route.path,
            "name": route.name,
            "methods": list(route.methods)
        })
    return routes
