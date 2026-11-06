import secrets
from hmac import compare_digest

from fastapi import (
  APIRouter,
  Depends,
  Header,
  HTTPException,
  Request,
  Response,
  status,
)
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from database import get_db
from models import User
from security import hash_password, verify_password


router = APIRouter(prefix="/api", tags=["authentication"])


class Credentials(BaseModel):
  email: str = Field(min_length=3, max_length=255)
  password: str = Field(min_length=12, max_length=128)


def get_current_user(
  request: Request,
  db: Session = Depends(get_db),
) -> User:
  user_id = request.session.get("user_id")

  if user_id is None:
    raise HTTPException(
      status_code=401,
        detail="Not authenticated"
    )

  user = db.get(User, user_id)

  if user is None:
    request.session.clear()
    raise HTTPException(
      status_code=401,
      detail="User not found"
    )

  return user


def verify_csrf(
  request: Request,
  x_csrf_token: str | None = Header(default=None),
):
  expected_token = request.session.get("csrf_token")

  if (
    not expected_token
    or not x_csrf_token
    or not compare_digest(expected_token, x_csrf_token)
  ):
    raise HTTPException(
      status_code=403,
      detail="Invalid or missing CSRF token"
      )


def start_session(request: Request, user: User) -> str:
  csrf_token = secrets.token_urlsafe(32)

  request.session.clear()
  request.session["user_id"] = user.id
  request.session["csrf_token"] = csrf_token

  return csrf_token


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(
  credentials: Credentials,
  request: Request,
  db: Session = Depends(get_db),
):
  email = credentials.email.strip().lower()

  if "@" not in email:
    raise HTTPException(
      status_code=422,
      detail="Invalid email address"
      )

  existing_user = db.scalar(
    select(User).where(User.email == email)
  )

  if existing_user:
    raise HTTPException(
      status_code=409,
      detail="Email already registered"
      )

  user = User(
    email=email,
    hashed_password=hash_password(credentials.password),
  )

  db.add(user)

  try:
    db.commit()
    db.refresh(user)
  except IntegrityError:
    db.rollback()
    raise HTTPException(
      status_code=409,
      detail="Email already registered"
    )

  csrf_token = start_session(request, user)

  return {
    "email": user.email,
    "csrfToken": csrf_token,
  }


@router.post("/login")
def login(
  credentials: Credentials,
  request: Request,
  db: Session = Depends(get_db),
):
  email = credentials.email.strip().lower()

  user = db.scalar(
    select(User).where(User.email == email)
  )

  if not user or not verify_password(
    credentials.password,
    user.hashed_password
  ):
    raise HTTPException(
      status_code=401,
      detail="Incorrect email or password"
    )

  csrf_token = start_session(request, user)

  return {
    "email": user.email,
    "csrfToken": csrf_token,
  }


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(
  request: Request,
  current_user: User = Depends(get_current_user),
  _: None = Depends(verify_csrf),
):
  request.session.clear()
  return Response(status_code=204)


@router.get("/me")
def me(
  current_user: User = Depends(get_current_user),
):
  return {"email": current_user.email}