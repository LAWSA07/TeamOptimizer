from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class Skill(BaseModel):
    name: str
    level: Optional[str] = None

class EmployeeInDB(BaseModel):
    id: Optional[str] = None
    name: str
    email: str
    skills: List[Skill]
    gender: Optional[str] = None
    department: Optional[str] = None
    created_at: Optional[datetime] = None

class EmployeeCreate(BaseModel):
    name: str
    email: str
    skills: List[Skill]
    gender: Optional[str] = None
    department: Optional[str] = None

class EmployeeUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    skills: Optional[List[Skill]] = None
    gender: Optional[str] = None
    department: Optional[str] = None

class EmployeeOut(BaseModel):
    id: str
    name: str
    email: str
    skills: List[Skill]
    gender: Optional[str] = None
    department: Optional[str] = None
    created_at: Optional[datetime] = None 