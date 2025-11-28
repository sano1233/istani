import httpx
from collections import deque
import asyncio

class OpenRouterClient:
    def __init__(self, api_keys: list[str]):
        if not api_keys:
            raise ValueError("At least one OpenRouter API key is required")
        self.keys = deque(api_keys)

    async def generate(self, model: str, messages: list) -> str:
        if not self.keys:
            return "Error: No API keys configured."
        key = self.keys[0]

        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    "https://openrouter.ai/api/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {key}",
                        "HTTP-Referer": "https://istani.org",
                        "Content-Type": "application/json",
                    },
                    json={"model": model, "messages": messages},
                )
                if response.status_code != 200:
                    return f"Error {response.status_code}: {response.text[:200]}"
                data = response.json()
                return data["choices"][0]["message"]["content"]
        except Exception as e:
            return f"Error: {str(e)}"
