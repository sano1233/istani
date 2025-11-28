from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    openrouter_keys: str = ""
    gemini_api_key: str = ""

    class Config:
        env_file = ".env.local"
        case_sensitive = False
        extra = "ignore"

    @property
    def openrouter_keys_list(self) -> List[str]:
        """
        Parse the comma-separated `openrouter_keys` string into a list of trimmed, non-empty keys.
        
        If `openrouter_keys` is empty or falsy, an empty list is returned.
        
        Returns:
            List[str]: Trimmed, non-empty API keys parsed from `openrouter_keys`.
        """
        if not self.openrouter_keys: return []
        return [k.strip() for k in self.openrouter_keys.split(",") if k.strip()]

settings = Settings()