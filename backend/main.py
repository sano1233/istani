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
    """
    Report service health status.
    
    Returns:
        dict: JSON-serializable mapping with key "status" set to "ok".
    """
    return {"status": "ok"}

@app.post("/swarm")
async def swarm(req: Req, x_openrouter_key: Optional[str] = Header(None), x_gemini_key: Optional[str] = Header(None)):
    """
    Stream a generated text response for the provided prompt via Server-Sent Events.
    
    Parameters:
        req (Req): Request body containing the `prompt` to process.
        x_openrouter_key (Optional[str]): Optional OpenRouter API key that, if provided, overrides the configured OpenRouter keys.
        x_gemini_key (Optional[str]): Optional Gemini API key that, if provided, overrides the configured Gemini key.
    
    Returns:
        StreamingResponse: A response with media type "text/event-stream" that yields SSE `data:` lines containing a JSON object with a `text` field (e.g. `{"text": "..."} `).
    
    Raises:
        HTTPException: 401 if no OpenRouter key is available.
    """
    keys = [x_openrouter_key] if x_openrouter_key else settings.openrouter_keys_list
    if not keys or not keys[0]:
        raise HTTPException(401, "Missing OpenRouter Key")

    swarm = SwarmRouter(keys, x_gemini_key or settings.gemini_api_key)

    async def gen():
        """
        Produce a single Server-Sent Events (SSE) data message containing the processed intent text.
        
        Yields:
            str: An SSE-formatted data line (e.g., "data: {...}\n\n") whose JSON payload contains a `text` field with the result of processing `req.prompt`.
        """
        text = await swarm.process_intent(req.prompt)
        yield f"data: {json.dumps({'text': text})}\n\n"

    return StreamingResponse(gen(), media_type="text/event-stream")