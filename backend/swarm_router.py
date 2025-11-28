from backend.clients.openrouter import OpenRouterClient
from backend.clients.gemini import GeminiClient
import asyncio

class SwarmRouter:
    def __init__(self, or_keys: list[str], gemini_key: str = ""):
        self.or_client = OpenRouterClient(or_keys)
        self.gemini_client = GeminiClient(gemini_key) if gemini_key else None

    async def process_intent(self, prompt: str) -> str:
        plan = await self.gemini_client.generate("Act as CTO. Plan implementation.", prompt) if self.gemini_client else ""
        code = await self.or_client.generate(
            "qwen/qwen-2.5-coder-32b-instruct:free",
            [{"role": "system", "content": "You are a coder."}, {"role": "user", "content": f"Plan: {plan}\nTask: {prompt}"}]
        )
        return f"## PLAN\n{plan}\n\n## CODE\n{code}"
