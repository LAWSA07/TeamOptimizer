from fastapi import APIRouter, HTTPException, Request
from .models import UserCreate, UserLogin, UserOut, hash_password, verify_password
from datetime import datetime, timedelta
from jose import JWTError, jwt
from bson import ObjectId
import os

router = APIRouter()

SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@router.post("/register", response_model=UserOut)
async def register(user: UserCreate, request: Request):
    db = request.app.mongodb["users"]
    
    # Check if user already exists
    existing_user = await db.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    user_data = {
        "name": user.name,
        "email": user.email,
        "hashed_password": hash_password(user.password),
        "created_at": datetime.utcnow()
    }
    
    result = await db.insert_one(user_data)
    user_data["id"] = str(result.inserted_id)
    
    # Audit log
    await request.app.mongodb["audit_logs"].insert_one({
        "action": "user_register",
        "user_id": str(result.inserted_id),
        "timestamp": datetime.utcnow()
    })
    
    return UserOut(**user_data)

@router.post("/login")
async def login(user: UserLogin, request: Request):
    db = request.app.mongodb["users"]
    
    # Find user
    user_data = await db.find_one({"email": user.email})
    if not user_data or not verify_password(user.password, user_data["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Create access token
    access_token = create_access_token(data={"sub": str(user_data["_id"])})
    
    # Audit log
    await request.app.mongodb["audit_logs"].insert_one({
        "action": "user_login",
        "user_id": str(user_data["_id"]),
        "timestamp": datetime.utcnow()
    })
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/audit-logs")
async def get_audit_logs(request: Request):
    db = request.app.mongodb["audit_logs"]
    logs = await db.find().sort("timestamp", -1).limit(100).to_list(100)
    return logs 