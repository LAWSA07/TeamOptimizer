from fastapi import APIRouter, HTTPException, Request
from .models import ProjectCreate, ProjectUpdate, ProjectOut
from bson import ObjectId
from datetime import datetime
from typing import List

router = APIRouter()

@router.get("/", response_model=List[ProjectOut])
async def get_projects(request: Request):
    db = request.app.mongodb["projects"]
    projects = await db.find().to_list(1000)
    result = []
    for proj in projects:
        # Handle missing created_at field for existing data
        if "created_at" not in proj:
            proj["created_at"] = None
        result.append(ProjectOut(id=str(proj["_id"]), **proj))
    return result

@router.get("/{project_id}", response_model=ProjectOut)
async def get_project(project_id: str, request: Request):
    db = request.app.mongodb["projects"]
    project = await db.find_one({"_id": ObjectId(project_id)})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    # Handle missing created_at field for existing data
    if "created_at" not in project:
        project["created_at"] = None
    return ProjectOut(id=str(project["_id"]), **project)

@router.post("/", response_model=ProjectOut)
async def create_project(project: ProjectCreate, request: Request):
    db = request.app.mongodb["projects"]
    project_data = project.model_dump()
    project_data["created_at"] = datetime.utcnow()
    
    result = await db.insert_one(project_data)
    project_data["id"] = str(result.inserted_id)
    
    # Audit log (optional)
    try:
        await request.app.mongodb["audit_logs"].insert_one({
            "action": "create_project",
            "project_id": str(result.inserted_id),
            "timestamp": datetime.utcnow()
        })
    except:
        pass  # Skip audit log if it fails
    
    return ProjectOut(**project_data)

@router.put("/{project_id}", response_model=ProjectOut)
async def update_project(project_id: str, project: ProjectUpdate, request: Request):
    db = request.app.mongodb["projects"]
    
    update_data = {k: v for k, v in project.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    result = await db.update_one(
        {"_id": ObjectId(project_id)},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Audit log (optional)
    try:
        await request.app.mongodb["audit_logs"].insert_one({
            "action": "update_project",
            "project_id": project_id,
            "timestamp": datetime.utcnow()
        })
    except:
        pass  # Skip audit log if it fails
    
    # Return updated project
    updated_project = await db.find_one({"_id": ObjectId(project_id)})
    return ProjectOut(id=str(updated_project["_id"]), **updated_project)

@router.delete("/{project_id}")
async def delete_project(project_id: str, request: Request):
    db = request.app.mongodb["projects"]
    result = await db.delete_one({"_id": ObjectId(project_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Audit log (optional)
    try:
        await request.app.mongodb["audit_logs"].insert_one({
            "action": "delete_project",
            "project_id": project_id,
            "timestamp": datetime.utcnow()
        })
    except:
        pass  # Skip audit log if it fails
    
    return {"message": "Project deleted successfully"} 