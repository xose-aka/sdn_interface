import uvicorn
from app.startup import setup_app

# Apply startup configurations
result = setup_app()

if result is False:
    print("App setup went wrong.")
    exit(1)


if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
