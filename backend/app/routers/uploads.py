from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from .. import crud, schemas, models
from ..utils.ai_processing import classify_image
from ..database import get_db
from ..auth import get_current_user
import os
from pathlib import Path
from uuid import uuid4
from mimetypes import guess_type

router = APIRouter()
UPLOAD_DIR = Path("app/uploads")
UPLOAD_DIR.mkdir(exist_ok=True)
# # replace with:
# UPLOAD_DIR = Path(os.getenv("UPLOAD_DIR", "app/uploads"))

ALLOWED_MIME_TYPES = {"image/jpeg", "image/png"}
MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB

def validate_upload_file_and_store(file: UploadFile):
    # Validate MIME type
    mime_type, _ = guess_type(file.filename)
    if mime_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(status_code=400, detail=f"Only image files (JPEG, PNG) allowed. Got: {mime_type}")
    
    # Validate file size
    file.file.seek(0, 2)  # seek to end
    file_size = file.file.tell()
    file.file.seek(0)  # reset to beginning
    if file_size > MAX_FILE_SIZE_BYTES:
        raise HTTPException(status_code=400, detail=f"File too large. Max 10 MB allowed. Got: {file_size / (1024*1024):.2f} MB")
    
    # Generate unique storage filename
    file_extension = file.filename.rsplit(".", 1)[-1] if "." in file.filename else ""
    if file_extension not in {"jpg", "jpeg", "png"}:
        raise HTTPException(status_code=400, detail="File extension must be .jpg, .jpeg, or .png")
    storage_filename = f"{uuid4().hex}.{file_extension}"
    file_path = UPLOAD_DIR / storage_filename
    if os.path.exists(file_path):
        raise HTTPException(status_code=400, detail="File already exists")
    
    # Save file to disk
    try:
        with file_path.open("wb") as f:
            f.write(file.file.read())
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")
    
    return storage_filename

@router.post("/", response_model=schemas.Upload)
def create_upload(
    lat: float = Form(None),
    lon: float = Form(None),
    depth: float = Form(None),
    file: UploadFile = File(...),
    notes: str = Form(None),
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    storage_filename = validate_upload_file_and_store(file)

    # Create upload record
    upload_data = schemas.UploadCreate(  # align with schemas
        filename=Path(file.filename).name,
        storage_filename=storage_filename,
        lat=lat,
        lon=lon,
        depth=depth,
        notes=notes,
        user_id=current_user.id
    )
    db_upload = crud.create_upload(db, upload=upload_data)
    return db_upload

def get_owned_upload(upload_id: int, db: Session, current_user: schemas.User):
    upload = crud.get_upload(db, upload_id=upload_id)
    if not (upload.user_id == current_user.id or current_user.role == models.UserRole.ADMIN):
        raise HTTPException(status_code=403, detail="Not authorised to modify this upload")
    return upload

@router.put("/{upload_id}/label", response_model=schemas.Upload)
def set_label(
    upload_id: int,
    label: str,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    upload = get_owned_upload(upload_id, db, current_user)
    label_data = schemas.UpdateUploadLabel(
        filename=upload.filename,
        label_type="user_defined",
        label=label
    )
    return crud.update_upload_label(db, upload_id=upload_id, upload_data=label_data)

@router.put("/{upload_id}/classify", response_model=schemas.Upload)
def classify_upload(
    upload_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    upload = get_owned_upload(upload_id, db, current_user)
    file_path = UPLOAD_DIR / upload.storage_filename
    result = classify_image(file_path)
    result_data = schemas.UpdateUploadLabel(
        filename=upload.filename,
        label_type="model_defined",
        **result
    )
    return crud.update_upload(db, upload_id=upload_id, upload=result_data)

@router.get("/", response_model=list[schemas.Upload])
def list_uploads(skip: int = 0, limit: int = 20, user_id: int = None, db: Session = Depends(get_db)):
    return crud.list_uploads(db, skip=skip, limit=limit, user_id=user_id)

@router.get("/{upload_id}", response_model=schemas.Upload)
def get_upload(upload_id: int, db: Session = Depends(get_db)):
    return crud.get_upload(db, upload_id=upload_id)
