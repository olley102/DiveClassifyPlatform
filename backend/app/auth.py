from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from . import crud
from .database import get_db

# JWT configuration
SECRET_KEY = "651150012ad5102f030364013e22f00250d203f6f1bc721beb9c719b34f49f0c"
# Replace with secure key (e.g., from env variable), i.e.
# import os
# from dotenv import load_dotenv
# load_dotenv()
# SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/token")

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt_sha256"], deprecated="auto")

def authenticate_user(username: str, password: str, db: Session = Depends(get_db)):
    try:
        user = crud.get_user(db, username=username)
    except HTTPException as e:  # catch HTTPException from crud
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    if len(password.encode("utf-8")) > 72:
        raise ValueError("Password must not exceed 72 bytes")
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if username is None:
            print("username none error")
            raise credentials_exception
    except JWTError:
        print("jwterror")
        raise credentials_exception
    user = crud.get_user(username=username, db=db)
    if user is None:
        print("user none error")
        raise credentials_exception
    return user
