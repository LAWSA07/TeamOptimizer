from fastapi import APIRouter, HTTPException, Request, Depends
from .models import (
    Feedback, ApprovalRequest, Comment, Notification, CollaborationSummary,
    FeedbackType, ApprovalStatus, NotificationType
)
from datetime import datetime
from bson import ObjectId
from typing import List, Optional
import json

router = APIRouter()

# Feedback endpoints
@router.post("/feedback", response_model=Feedback)
async def create_feedback(feedback: Feedback, request: Request):
    """Create new feedback for a project or team"""
    db = request.app.mongodb["feedback"]
    
    feedback_dict = feedback.dict()
    feedback_dict["created_at"] = datetime.utcnow()
    feedback_dict["_id"] = ObjectId()
    
    result = await db.insert_one(feedback_dict)
    feedback_dict["id"] = str(result.inserted_id)
    
    # Create notification for project owner
    await create_notification(
        request,
        user_id=feedback.user_id,
        notification_type=NotificationType.FEEDBACK_RECEIVED,
        title="New Feedback Received",
        message=f"Feedback received for project: {feedback.feedback_type.value}",
        project_id=feedback.project_id
    )
    
    return Feedback(**feedback_dict)

@router.get("/feedback/{project_id}", response_model=List[Feedback])
async def get_project_feedback(project_id: str, request: Request):
    """Get all feedback for a project"""
    db = request.app.mongodb["feedback"]
    
    feedback_list = await db.find({"project_id": project_id}).to_list(1000)
    
    # Convert ObjectId to string
    for feedback in feedback_list:
        feedback["id"] = str(feedback["_id"])
        del feedback["_id"]
    
    return [Feedback(**feedback) for feedback in feedback_list]

# Approval endpoints
@router.post("/approvals", response_model=ApprovalRequest)
async def create_approval_request(approval: ApprovalRequest, request: Request):
    """Create a new approval request"""
    db = request.app.mongodb["approvals"]
    
    approval_dict = approval.dict()
    approval_dict["created_at"] = datetime.utcnow()
    approval_dict["status"] = ApprovalStatus.PENDING
    approval_dict["_id"] = ObjectId()
    
    result = await db.insert_one(approval_dict)
    approval_dict["id"] = str(result.inserted_id)
    
    # Create notification for approver
    await create_notification(
        request,
        user_id=approval.approver_id,
        notification_type=NotificationType.APPROVAL_REQUEST,
        title="Approval Request",
        message=f"Approval requested by {approval.requester_name}",
        project_id=approval.project_id
    )
    
    return ApprovalRequest(**approval_dict)

@router.put("/approvals/{approval_id}", response_model=ApprovalRequest)
async def update_approval_status(
    approval_id: str, 
    status: ApprovalStatus, 
    notes: Optional[str] = None,
    request: Request = None
):
    """Update approval status"""
    db = request.app.mongodb["approvals"]
    
    update_data = {
        "status": status,
        "updated_at": datetime.utcnow()
    }
    
    if status == ApprovalStatus.APPROVED:
        update_data["approved_at"] = datetime.utcnow()
    
    if notes:
        update_data["approval_notes"] = notes
    
    result = await db.update_one(
        {"_id": ObjectId(approval_id)},
        {"$set": update_data}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Approval request not found")
    
    # Get updated approval
    approval = await db.find_one({"_id": ObjectId(approval_id)})
    approval["id"] = str(approval["_id"])
    del approval["_id"]
    
    # Create notification for requester
    await create_notification(
        request,
        user_id=approval["requester_id"],
        notification_type=NotificationType.STATUS_CHANGE,
        title="Approval Status Updated",
        message=f"Your approval request has been {status.value}",
        project_id=approval["project_id"]
    )
    
    return ApprovalRequest(**approval)

@router.get("/approvals/{project_id}", response_model=List[ApprovalRequest])
async def get_project_approvals(project_id: str, request: Request):
    """Get all approval requests for a project"""
    db = request.app.mongodb["approvals"]
    
    approvals = await db.find({"project_id": project_id}).to_list(1000)
    
    # Convert ObjectId to string
    for approval in approvals:
        approval["id"] = str(approval["_id"])
        del approval["_id"]
    
    return [ApprovalRequest(**approval) for approval in approvals]

# Comment endpoints
@router.post("/comments", response_model=Comment)
async def create_comment(comment: Comment, request: Request):
    """Create a new comment"""
    db = request.app.mongodb["comments"]
    
    comment_dict = comment.dict()
    comment_dict["created_at"] = datetime.utcnow()
    comment_dict["_id"] = ObjectId()
    
    result = await db.insert_one(comment_dict)
    comment_dict["id"] = str(result.inserted_id)
    
    # Create notification for project members
    await create_notification(
        request,
        user_id=comment.user_id,
        notification_type=NotificationType.COMMENT_ADDED,
        title="New Comment",
        message=f"New comment added by {comment.user_name}",
        project_id=comment.project_id
    )
    
    return Comment(**comment_dict)

@router.get("/comments/{project_id}", response_model=List[Comment])
async def get_project_comments(project_id: str, request: Request):
    """Get all comments for a project"""
    db = request.app.mongodb["comments"]
    
    comments = await db.find({"project_id": project_id}).sort("created_at", -1).to_list(100)
    
    # Convert ObjectId to string
    for comment in comments:
        comment["id"] = str(comment["_id"])
        del comment["_id"]
    
    return [Comment(**comment) for comment in comments]

# Notification endpoints
@router.get("/notifications/{user_id}", response_model=List[Notification])
async def get_user_notifications(user_id: str, request: Request):
    """Get notifications for a user"""
    db = request.app.mongodb["notifications"]
    
    notifications = await db.find({"user_id": user_id}).sort("created_at", -1).to_list(50)
    
    # Convert ObjectId to string
    for notification in notifications:
        notification["id"] = str(notification["_id"])
        del notification["_id"]
    
    return [Notification(**notification) for notification in notifications]

@router.put("/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: str, request: Request):
    """Mark a notification as read"""
    db = request.app.mongodb["notifications"]
    
    result = await db.update_one(
        {"_id": ObjectId(notification_id)},
        {"$set": {"read": True}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    return {"message": "Notification marked as read"}

@router.get("/notifications/{user_id}/unread-count")
async def get_unread_count(user_id: str, request: Request):
    """Get count of unread notifications for a user"""
    db = request.app.mongodb["notifications"]
    
    count = await db.count_documents({"user_id": user_id, "read": False})
    
    return {"unread_count": count}

# Collaboration summary
@router.get("/summary/{project_id}", response_model=CollaborationSummary)
async def get_collaboration_summary(project_id: str, request: Request):
    """Get collaboration summary for a project"""
    feedback_db = request.app.mongodb["feedback"]
    approvals_db = request.app.mongodb["approvals"]
    comments_db = request.app.mongodb["comments"]
    notifications_db = request.app.mongodb["notifications"]
    
    # Get feedback stats
    feedback_count = await feedback_db.count_documents({"project_id": project_id})
    
    # Calculate average rating
    pipeline = [
        {"$match": {"project_id": project_id}},
        {"$group": {"_id": None, "avg_rating": {"$avg": "$rating"}}}
    ]
    rating_result = await feedback_db.aggregate(pipeline).to_list(1)
    average_rating = rating_result[0]["avg_rating"] if rating_result else 0.0
    
    # Get recent approvals
    approvals = await approvals_db.find({"project_id": project_id}).sort("created_at", -1).to_list(10)
    for approval in approvals:
        approval["id"] = str(approval["_id"])
        del approval["_id"]
    
    # Get recent comments
    comments = await comments_db.find({"project_id": project_id}).sort("created_at", -1).to_list(10)
    for comment in comments:
        comment["id"] = str(comment["_id"])
        del comment["_id"]
    
    # Calculate overall satisfaction (weighted average of feedback and approvals)
    approval_satisfaction = 0.0
    if approvals:
        approved_count = sum(1 for a in approvals if a["status"] == ApprovalStatus.APPROVED)
        approval_satisfaction = approved_count / len(approvals)
    
    overall_satisfaction = (average_rating / 5.0 * 0.7) + (approval_satisfaction * 0.3)
    
    return CollaborationSummary(
        project_id=project_id,
        feedback_count=feedback_count,
        average_rating=average_rating,
        approval_requests=[ApprovalRequest(**a) for a in approvals],
        recent_comments=[Comment(**c) for c in comments],
        unread_notifications=0,  # Would need user_id to calculate this
        overall_satisfaction=overall_satisfaction
    )

# Helper function to create notifications
async def create_notification(request: Request, user_id: str, notification_type: NotificationType, 
                            title: str, message: str, project_id: Optional[str] = None, 
                            team_id: Optional[str] = None):
    """Helper function to create notifications"""
    db = request.app.mongodb["notifications"]
    
    notification = {
        "user_id": user_id,
        "notification_type": notification_type,
        "title": title,
        "message": message,
        "project_id": project_id,
        "team_id": team_id,
        "read": False,
        "created_at": datetime.utcnow(),
        "_id": ObjectId()
    }
    
    await db.insert_one(notification) 