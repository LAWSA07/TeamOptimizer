from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from typing import Optional
from datetime import datetime

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class UserInDB(BaseModel):
    id: Optional[str] = None
    name: str
    email: EmailStr
    hashed_password: str
    created_at: Optional[datetime] = None

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: str
    name: str
    email: EmailStr
    created_at: datetime

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password) 