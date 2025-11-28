import httpx

class GeminiClient:
    def __init__(self, api_key: str):
        self.api_key = api_key

    async def generate(self, sys_prompt: str, user_prompt: str) -> str:
        if not self.api_key:
            return ""
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                res = await client.post(
                    f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key={self.api_key}",
                    json={
                        "system_instruction": {"parts": [{"text": sys_prompt}]},
                        "contents": [{"parts": [{"text": user_prompt}]}],
                    },
                )
                if res.status_code != 200:
                    return ""
                data = res.json()
                return data["candidates"][0]["content"]["parts"][0]["text"]
        except Exception:
            return ""
