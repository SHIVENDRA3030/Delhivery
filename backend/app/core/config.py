import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Scalable Web App"
    API_V1_STR: str = "/api/v1"
    
    # Supabase (To be filled later)
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")
    
    # 60 days
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 60
    BACKEND_CORS_ORIGINS: list[str] = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")

    class Config:
        case_sensitive = True

settings = Settings()
