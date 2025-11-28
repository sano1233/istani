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
        if not self.openrouter_keys: return []
        return [k.strip() for k in self.openrouter_keys.split(",") if k.strip()]

settings = Settings()
