from backend.clients.openrouter import OpenRouterClient
from backend.clients.gemini import GeminiClient
import asyncio

class SwarmRouter:
    def __init__(self, or_keys: list[str], gemini_key: str = ""):
        """
        Initialize the SwarmRouter with OpenRouter credentials and an optional Gemini key.
        
        Parameters:
            or_keys (list[str]): List of API keys for OpenRouter; used to create the OpenRouter client.
            gemini_key (str): Optional API key for Gemini. If empty, Gemini integration is disabled and `self.gemini_client` is set to `None`.
        """
        self.or_client = OpenRouterClient(or_keys)
        self.gemini_client = GeminiClient(gemini_key) if gemini_key else None

    async def process_intent(self, prompt: str) -> str:
        """
        Generate a plan (using Gemini when available) and generate corresponding code with OpenRouter, returning both as a formatted string.
        
        Parameters:
            prompt (str): Description of the task to plan and implement.
        
        Returns:
            str: A string with two sections — "## PLAN" containing the generated plan (empty if Gemini client is not configured) and "## CODE" containing the generated code.
        """
        plan = await self.gemini_client.generate("Act as CTO. Plan implementation.", prompt) if self.gemini_client else ""
        code = await self.or_client.generate(
            "qwen/qwen-2.5-coder-32b-instruct:free",
            [{"role": "system", "content": "You are a coder."}, {"role": "user", "content": f"Plan: {plan}\nTask: {prompt}"}]
        )
        return f"## PLAN\n{plan}\n\n## CODE\n{code}"