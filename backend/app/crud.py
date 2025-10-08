from sqlalchemy.orm import Session, noload
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException
from typing_extensions import Literal
from . import models, schemas
from .auth import get_password_hash

from sqlalchemy.sql import text

def create_user(db: Session, user: schemas.UserCreate):
    print("Database URL in crud.create_user:", db.bind.url)
    try:
        hashed_password = get_password_hash(user.password)

        db_user = models.User(
            hashed_password=hashed_password,
            **user.model_dump(exclude={"password"})
        )

        db.add(db_user)
        print("Before flush in crud.create_user")
        db.flush()
        print("After flush, user ID:", db_user.id)
        tables = db.execute(text("SELECT name FROM sqlite_master WHERE type='table' AND name='users';")).fetchall()
        print("Users table exists before commit:", "Yes" if tables else "No")
        db.commit()
        print("After commit in crud.create_user")
        user_check = db.query(models.User).filter(models.User.id == db_user.id).first()
        print("User verification before refresh:", "Found" if user_check else "Not found")
        db.refresh(db_user)
        print("After refresh in crud.create_user")  # Debug
        tables = db.execute(text("SELECT name FROM sqlite_master WHERE type='table' AND name='users';")).fetchall()
        print("Users table exists after refresh:", "Yes" if tables else "No")
        return db_user
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(status_code=400, detail="Email already exists")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create user: {str(e)}")

def get_users(db: Session, skip: int = 0, limit: int = 20):
    query = db.query(models.User).options(noload(models.User.uploads))
    return query.offset(skip).limit(limit).all()

def get_user(db: Session, user_id: int):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

def update_user_role(
    db: Session,
    user_id: int,
    role: Literal["admin", "user"]
):
    user = get_user(user_id, db)
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
        raise HTTPException(status_code=400, detail="Failed to create upload due to database constraint")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create upload: {str(e)}")

def get_uploads(db: Session, skip: int = 0, limit: int = 20, user_id: int = None):
    query = db.query(models.Upload)
    if user_id is not None:
        query = query.filter(models.Upload.user_id == user_id)
    return query.offset(skip).limit(limit).all()

def create_model_result(db: Session, result: schemas.ModelResultCreate, upload_id: int):
    # Verify upload exists
    if not db.query(models.Upload).filter(models.Upload.id == upload_id).first():
        raise HTTPException(status_code=404, detail="Upload not found")
    
    try:
        db_result = models.ModelResult(**result.model_dump(), upload_id=upload_id)
        db.add(db_result)
        db.commit()
        db.refresh(db_result)
        return db_result
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(status_code=400, detail="Failed to create model result due to database constraint")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create model result: {str(e)}")

def update_upload(db: Session, upload_id: int, upload: schemas.UploadBase):
    db_upload = db.query(models.Upload).filter(models.Upload.id == upload_id).first()
    if not db_upload:
        raise HTTPException(status_code=404, detail="Upload not found")
    
    try:
        for key, value in upload.model_dump(exclude_unset=True).items():
            setattr(db_upload, key, value)
        db.commit()
        db.refresh(db_upload)
        return db_upload
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update upload: {str(e)}")

def delete_upload(db: Session, upload_id: int):
    db_upload = db.query(models.Upload).filter(models.Upload.id == upload_id).first()
    if not db_upload:
        raise HTTPException(status_code=404, detail="Upload not found")
    
    try:
        db.delete(db_upload)
        db.commit()
        return {"detail": "Upload deleted"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete upload: {str(e)}")

def list_results(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.ModelResult).offset(skip).limit(limit).all()

def get_results_for_upload(db: Session, upload_id: int):
    # Verify upload exists
    if not db.query(models.Upload).filter(models.Upload.id == upload_id).first():
        raise HTTPException(status_code=404, detail="Upload not found")
    
    return db.query(models.ModelResult).filter_by(upload_id=upload_id).all()
