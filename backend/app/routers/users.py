from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing_extensions import Literal
from .. import crud, schemas, models, auth
from ..database import get_db
from ..auth import get_current_user

router = APIRouter()

@router.post("/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
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
    return crud.list_users(db, skip=skip, limit=limit)

@router.get("/{username}", response_model=schemas.UserPublic)
def get_user(username: str, db: Session = Depends(get_db)):
    return crud.get_user(db, username=username)

@router.get("/{username}/uploads", response_model=list[schemas.Upload])
def list_user_uploads(username: str, skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    user = crud.get_user(db, username=username)
    return crud.list_uploads(db, skip=skip, limit=limit, user_id=user.id)

@router.put("/{username}/role", response_model=schemas.UserPublic)
def update_user_role(
    username: str,
    role: Literal["admin", "user"],
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(auth.get_current_user)
):
    if current_user.role != models.UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    user = crud.update_user_role(db, username=username, role=role)
    return user
