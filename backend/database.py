import os
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.engine import URL
from sqlalchemy.orm import DeclarativeBase, sessionmaker

DATABASE_PATH = Path(__file__).resolve().parent / "solar.db"

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
  DATABASE_URL = URL.create(
  "sqlite",
  database=str(DATABASE_PATH)
  )

connect_args = (
  {"check_same_thread": False}
  if str(DATABASE_URL).startswith("sqlite")
  else {}
)

engine = create_engine(
  DATABASE_URL,
  connect_args=connect_args
)

SessionLocal = sessionmaker(
  bind=engine,
  autoflush=False,
  autocommit=False
)


class Base(DeclarativeBase):
  pass


def get_db():
  db = SessionLocal()
  try:
    yield db
  finally:
    db.close()