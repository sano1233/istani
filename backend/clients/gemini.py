import httpx

class GeminiClient:
    def __init__(self, api_key: str):
        """
        Initialize the GeminiClient with the provided API key.
        
        Parameters:
            api_key (str): API key used to authenticate requests to the Gemini content generation API. If falsy, generation calls will not attempt authenticated requests.
        """
        self.api_key = api_key

    async def generate(self, sys_prompt: str, user_prompt: str) -> str:
        """
        Generate text from Gemini 2.0 using the provided system and user prompts.
        
        Sends the prompts to the Gemini generateContent endpoint and returns the first candidate's text. Returns an empty string if the client has no API key, the HTTP response status is not 200, or any error occurs while requesting or parsing the response.
        
        Parameters:
            sys_prompt (str): System-level instruction that guides the model's behavior.
            user_prompt (str): User-facing prompt content to generate a response for.
        
        Returns:
            str: The generated text from the first candidate, or an empty string on failure.
        """
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