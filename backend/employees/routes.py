from fastapi import APIRouter, HTTPException, Request
from .models import EmployeeCreate, EmployeeUpdate, EmployeeOut
from bson import ObjectId
from datetime import datetime
from typing import List

router = APIRouter()

@router.get("/", response_model=List[EmployeeOut])
async def get_employees(request: Request):
    db = request.app.mongodb["employees"]
    employees = await db.find().to_list(1000)
    result = []
    for emp in employees:
        # Handle missing created_at field for existing data
        if "created_at" not in emp:
            emp["created_at"] = None
        result.append(EmployeeOut(id=str(emp["_id"]), **emp))
    return result

@router.get("/{employee_id}", response_model=EmployeeOut)
async def get_employee(employee_id: str, request: Request):
    db = request.app.mongodb["employees"]
    employee = await db.find_one({"_id": ObjectId(employee_id)})
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    # Handle missing created_at field for existing data
    if "created_at" not in employee:
        employee["created_at"] = None
    return EmployeeOut(id=str(employee["_id"]), **employee)

@router.post("/", response_model=EmployeeOut)
async def create_employee(employee: EmployeeCreate, request: Request):
    db = request.app.mongodb["employees"]
    employee_data = employee.model_dump()
    employee_data["created_at"] = datetime.utcnow()
    
    result = await db.insert_one(employee_data)
    employee_data["id"] = str(result.inserted_id)
    
    # Audit log (optional)
    try:
        await request.app.mongodb["audit_logs"].insert_one({
            "action": "create_employee",
            "employee_id": str(result.inserted_id),
            "timestamp": datetime.utcnow()
        })
    except:
        pass  # Skip audit log if it fails
    
    return EmployeeOut(**employee_data)

@router.put("/{employee_id}", response_model=EmployeeOut)
async def update_employee(employee_id: str, employee: EmployeeUpdate, request: Request):
    db = request.app.mongodb["employees"]
    
    update_data = {k: v for k, v in employee.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    result = await db.update_one(
        {"_id": ObjectId(employee_id)},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    # Audit log (optional)
    try:
        await request.app.mongodb["audit_logs"].insert_one({
            "action": "update_employee",
            "employee_id": employee_id,
            "timestamp": datetime.utcnow()
        })
    except:
        pass  # Skip audit log if it fails
    
    # Return updated employee
    updated_employee = await db.find_one({"_id": ObjectId(employee_id)})
    return EmployeeOut(id=str(updated_employee["_id"]), **updated_employee)

@router.delete("/{employee_id}")
async def delete_employee(employee_id: str, request: Request):
    db = request.app.mongodb["employees"]
    result = await db.delete_one({"_id": ObjectId(employee_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    # Audit log (optional)
    try:
        await request.app.mongodb["audit_logs"].insert_one({
            "action": "delete_employee",
            "employee_id": employee_id,
            "timestamp": datetime.utcnow()
        })
    except:
        pass  # Skip audit log if it fails
    
    return {"message": "Employee deleted successfully"} 