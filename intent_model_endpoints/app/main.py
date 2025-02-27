from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.v1.endpoints.intent import router as intent_endpoint
from api.v1.endpoints.auth import router as auth_endpoint
from api.v1.endpoints.topo import router as topology_endpoint

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this to specify allowed origins
    allow_credentials=True,
    allow_methods=["*"],  # Adjust this to specify allowed HTTP methods
    allow_headers=["*"],  # Adjust this to specify allowed headers
)

app.include_router(intent_endpoint,   prefix="/api/v1/intents")
app.include_router(topology_endpoint, prefix="/api/v1/topology")
app.include_router(auth_endpoint,     prefix="/api/v1")


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
