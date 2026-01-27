from typing import Generator, Annotated
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import create_client, Client
from app.core.config import settings

# Supabase Client Factory
def get_supabase() -> Generator[Client, None, None]:
    client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
    try:
        yield client
    finally:
        pass # Client cleanup if needed

# JWT Authentication
security = HTTPBearer()

def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)],
    supabase: Annotated[Client, Depends(get_supabase)]
) -> dict:
    """
    Verifies the JWT token with Supabase Auth.
    Returns the user dictionary if valid, raises 401 otherwise.
    """
    token = credentials.credentials
    try:
        # Supabase-py's auth.get_user(token) validates the JWT
        user = supabase.auth.get_user(token)
        if not user:
             raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        # Identify admin role (optional, based on metadata or helper)
        # Note: In real app, we might check public.user_profiles or app_metadata
        return user.user
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Could not validate credentials: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )
