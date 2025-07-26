from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class Role(BaseModel):
    role: str
    description: Optional[str] = None

class ProjectInDB(BaseModel):
    id: Optional[str] = None
    name: str
    description: str
    required_roles: List[Role]
    constraints: Optional[str] = None
    created_at: Optional[datetime] = None

class ProjectCreate(BaseModel):
    name: str
    description: str
    required_roles: List[Role]
    constraints: Optional[str] = None

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    required_roles: Optional[List[Role]] = None
    constraints: Optional[str] = None

class ProjectOut(BaseModel):
    id: str
    name: str
    description: str
    required_roles: List[Role]
    constraints: Optional[str] = None
    created_at: Optional[datetime] = None 