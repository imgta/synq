from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from core import naics

app = FastAPI()
app.include_router(naics.router)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Hello World"}