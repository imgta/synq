from fastapi import HTTPException, Header, status
from typing import Annotated
import os, secrets

SECRET_TOKEN = os.environ["FASTAPI_SECRET_TOKEN"]

async def verify_auth_header(auth_header: Annotated[str, Header(alias="Authorization")]):
    if SECRET_TOKEN is None:
        raise RuntimeError("Authorization token is unset.")

    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authorization token.")

    # handle non-ASCII characters (unicodes) by normalizing strings UTF-8 encoded bytes
    user_token = auth_header[len("Bearer ") :].encode("utf-8")
    auth_token = SECRET_TOKEN.encode("utf-8")

    # perform constant-time comparison to prevent timing attacks
    if not secrets.compare_digest(user_token, auth_token):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authorization token.")