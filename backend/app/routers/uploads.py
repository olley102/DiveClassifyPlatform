from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from .. import crud, schemas
from ..utils.ai_processing import classify_image
from ..database import get_db
from ..auth import get_current_user
import shutil, os
from pathlib import Path

router = APIRouter()
UPLOAD_DIR = "app/uploads"
# # replace with:
# UPLOAD_DIR = os.getenv("UPLOAD_DIR", "app/uploads")

@router.post("/", response_model=schemas.Upload)
def create_upload(
    user_id: int = Form(...),
    lat: float = Form(None),
    lon: float = Form(None),
    depth: float = Form(None),
    file: UploadFile = File(...),
    notes: str = Form(None),
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Cannot create upload for another user")

    os.makedirs(UPLOAD_DIR, exist_ok=True)

    filename = Path(file.filename).name
    file_path = os.path.join(UPLOAD_DIR, filename)
    if os.path.exists(file_path):
        raise HTTPException(status_code=400, detail="File already exists")
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except IOError as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")

    # Create upload record
    upload_data = schemas.UploadCreate(  # align with schemas
        filename=file.filename,
        lat=lat,
        lon=lon,
        depth=depth,
        notes=notes,
        user_id=user_id
    )
    db_upload = crud.create_upload(db, upload=upload_data)

    # # Run AI classification
    # # TODO: make this a background task
    # result = classify_image(file_path)
    # # check result matches validation in schemas
    # if ...
    #     raise(...)
    # result_data = schemas.ModelResultCreate(
    #     label=result["label"],
    #     health_score=result["health_score"],
    #     notes="Auto-classified"
    # )
    # crud.create_model_result(db, result=result_data, upload_id=db_upload.id)

    return db_upload

def run_classification(upload_id: int, file_path: str, db: Session = Depends(get_db)):
    result = classify_image(file_path)
    result_data = schemas.ModelResultCreate(
        label=result["label"],
        health_score=result["health_score"],
        notes="Auto-classified"
    )
    return crud.create_model_result(db, result=result_data, upload_id=upload_id)

@router.get("/", response_model=list[schemas.Upload])
def list_uploads(skip: int = 0, limit: int = 20, user_id: int = None, db: Session = Depends(get_db)):
    return crud.get_uploads(db, skip=skip, limit=limit, user_id=user_id)
