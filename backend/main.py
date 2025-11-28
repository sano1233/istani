from fastapi import FastAPI, Header, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from backend.settings import settings
from backend.swarm_router import SwarmRouter
from typing import Optional
import json

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

class Req(BaseModel):
    prompt: str

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.post("/swarm")
async def swarm(req: Req, x_openrouter_key: Optional[str] = Header(None), x_gemini_key: Optional[str] = Header(None)):
    keys = [x_openrouter_key] if x_openrouter_key else settings.openrouter_keys_list
    if not keys or not keys[0]:
        raise HTTPException(401, "Missing OpenRouter Key")

    swarm = SwarmRouter(keys, x_gemini_key or settings.gemini_api_key)

    async def gen():
        text = await swarm.process_intent(req.prompt)
        yield f"data: {json.dumps({'text': text})}\n\n"

    return StreamingResponse(gen(), media_type="text/event-stream")
