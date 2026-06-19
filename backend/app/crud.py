from sqlalchemy.orm import Session, noload
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException
from fastapi.responses import JSONResponse
from typing_extensions import Literal
from passlib.context import CryptContext
from . import models, schemas

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt_sha256"], deprecated="auto")

def get_password_hash(password: str) -> str:  # placed in crud to avoid circular import with auth
    if len(password.encode("utf-8")) > 72:
        raise ValueError("Password must not exceed 72 bytes")
    return pwd_context.hash(password)

def create_user(db: Session, user: schemas.UserCreate):
    errors = {}

    if db.query(models.User).filter(models.User.username == user.username).first():
        errors["username"] = "Username already exists."
    if db.query(models.User).filter(models.User.email == user.email).first():
        errors["email"] = "Email already exists."
    
    if errors:
        return JSONResponse(
            status_code=400,
            content={"errors": errors}
        )

    db_user = models.User(
        hashed_password=get_password_hash(user.password),
        **user.model_dump(exclude={"password"})
    )

    try:
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
    except IntegrityError as e:
        db.rollback()
        return JSONResponse(
            status_code=400,
            content={"errors": {"general": "Database integrity error, please retry."}}
        )
    except Exception as e:
        db.rollback()
        return JSONResponse(
            status_code=500,
            content={"errors": {"general": f"Failed to create user: {str(e)}"}}
        )

def list_users(db: Session, skip: int = 0, limit: int = 20):
    query = db.query(models.User).options(noload(models.User.uploads))
    return query.offset(skip).limit(limit).all()

def get_user(db: Session, username: str):
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

def get_user_by_id(db: Session, user_id: int):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

def get_user_by_email(db: Session, email: str):
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

def update_user_role(
    db: Session,
    username: str,
    role: Literal["admin", "user"]
):
    user = get_user(username, db)
    user.role = models.UserRole(role)
    db.commit()
    db.refresh(user)
    return user

def create_upload(db: Session, upload: schemas.UploadCreate):
    # Verify user exists
    if not db.query(models.User).filter(models.User.id == upload.user_id).first():
        raise HTTPException(status_code=404, detail="User not found")
    
    try:
        db_upload = models.Upload(**upload.model_dump())
        db.add(db_upload)
        db.commit()
        db.refresh(db_upload)
        return db_upload
    except IntegrityError as e:
        db.rollback()
        if "uploads.storage_filename" in str(e):
            raise HTTPException(status_code=400, detail="Storage filename already exists")
        raise HTTPException(status_code=400, detail="Failed to create upload due to database constraint")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create upload: {str(e)}")

def list_uploads(db: Session, skip: int = 0, limit: int = 20, user_id: int = None):
    query = db.query(models.Upload)
    if user_id is not None:
        query = query.filter(models.Upload.user_id == user_id)
    return query.offset(skip).limit(limit).all()

def get_upload(db: Session, upload_id: int):
    upload = db.query(models.Upload).filter(models.Upload.id == upload_id).first()
    if not upload:
        raise HTTPException(status_code=404, detail="Upload not found")
    return upload

def update_upload(db: Session, upload_id: int, upload: schemas.UploadBase):
    db_upload = get_upload(db, upload_id)
    
    try:
        for key, value in upload.model_dump(exclude_unset=True).items():
            setattr(db_upload, key, value)
        db.commit()
        db.refresh(db_upload)
        return db_upload
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update upload: {str(e)}")

def update_upload_label(db: Session, upload_id: int, upload_data: schemas.UpdateUploadLabel):
    db_upload = get_upload(db, upload_id)

    try:
        for key, value in upload_data.model_dump(exclude_unset=True).items():
            setattr(db_upload, key, value)
        db.commit()
        db.refresh(db_upload)
        return db_upload
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update upload: {str(e)}")

def delete_upload(db: Session, upload_id: int):
    db_upload = get_upload(db, upload_id)
    
    try:
        db.delete(db_upload)
        db.commit()
        return {"detail": "Upload deleted"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete upload: {str(e)}")
