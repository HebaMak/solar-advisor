import os
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from sqlalchemy import text
from starlette.middleware.sessions import SessionMiddleware

from database import engine, Base
from auth import router as auth_router
from sites import router as sites_router
import models


Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
  CORSMiddleware,
  allow_origins=["http://localhost:5173"],
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)

app.add_middleware(
  SessionMiddleware,
  secret_key=os.getenv(
    "SESSION_SECRET_KEY",
    "development-only-change-this-secret-key"
  ),
  session_cookie="solar_session",
  max_age=28800,
  same_site="lax",
  https_only=os.getenv("COOKIE_SECURE", "false").lower() == "true"
)

app.include_router(auth_router)
app.include_router(sites_router)


@app.get("/health/database")
def database_health():
  with engine.connect() as connection:
    connection.execute(text("SELECT 1"))

  return {"database": "connected"}


FRONTEND_DIST = Path(
  os.getenv(
    "FRONTEND_DIST",
    str(Path(__file__).resolve().parent.parent / "frontend" / "dist")
  )
).resolve()


@app.get("/", include_in_schema=False)
@app.get("/{full_path:path}", include_in_schema=False)
def serve_frontend(full_path: str = ""):
  index_file = FRONTEND_DIST / "index.html"

  if not index_file.exists():
    return {"message": "Solar Assessment API is running!"}

  if full_path:
    requested_file = (FRONTEND_DIST / full_path).resolve()

    try:
      requested_file.relative_to(FRONTEND_DIST)
    except ValueError:
      return FileResponse(index_file)

    if requested_file.is_file():
      return FileResponse(requested_file)

  return FileResponse(index_file)