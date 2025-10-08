from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from typing_extensions import Literal
from .. import crud, schemas, models, auth
from ..database import get_db
from ..auth import get_current_user

router = APIRouter()

@router.post("/token", response_model=schemas.Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = auth.get_user_by_email(db, email=form_data.username)
    if not user or not auth.verify_password(form_data.plain_password, form_data.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"}
        )
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    print("Database URL in users.create_user:", db.bind.url)
    return crud.create_user(db, user)

@router.get("/", response_model=list[schemas.UserPublic])
def get_users(
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    if current_user.role != models.UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    return crud.get_users(db, skip=skip, limit=limit)

@router.get("/{user_id}", response_model=schemas.UserPublic)
def get_user(user_id: int, db: Session = Depends(get_db)):
    return crud.get_user(db, user_id=user_id)

@router.put("/{user_id}/role", response_model=schemas.UserPublic)
def update_user_role(
    user_id: int,
    role: Literal["admin", "user"],
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(auth.get_current_user)
):
    if current_user.role != models.UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    user = crud.update_user_role(db, user_id=user_id, role=role)
    return user
