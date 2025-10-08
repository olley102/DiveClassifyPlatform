from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import crud, schemas
from ..database import get_db

router = APIRouter()

@router.get("/", response_model=list[schemas.ModelResult])
def list_results(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.list_results(db=db, skip=skip, limit=limit)

@router.get("/upload/{upload_id}", response_model=list[schemas.ModelResult])
def get_results_for_upload(upload_id: int, db: Session = Depends(get_db)):
    return crud.get_results_for_upload(db=db, upload_id=upload_id)
