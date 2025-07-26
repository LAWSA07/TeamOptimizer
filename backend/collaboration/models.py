from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime
from enum import Enum

class FeedbackType(str, Enum):
    TEAM_COMPOSITION = "team_composition"
    WORKLOAD_BALANCE = "workload_balance"
    SKILL_MATCH = "skill_match"
    DIVERSITY = "diversity"
    GENERAL = "general"

class ApprovalStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    REQUESTED_CHANGES = "requested_changes"

class NotificationType(str, Enum):
    TEAM_OPTIMIZATION = "team_optimization"
    APPROVAL_REQUEST = "approval_request"
    FEEDBACK_RECEIVED = "feedback_received"
    COMMENT_ADDED = "comment_added"
    STATUS_CHANGE = "status_change"

class Feedback(BaseModel):
    id: Optional[str] = None
    project_id: str
    team_id: Optional[str] = None
    user_id: str
    user_name: str
    feedback_type: FeedbackType
    rating: int  # 1-5 scale
    comment: str
    created_at: datetime
    updated_at: Optional[datetime] = None

class ApprovalRequest(BaseModel):
    id: Optional[str] = None
    project_id: str
    team_id: Optional[str] = None
    requester_id: str
    requester_name: str
    approver_id: str
    approver_name: str
    status: ApprovalStatus
    request_reason: str
    approval_notes: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    approved_at: Optional[datetime] = None

class Comment(BaseModel):
    id: Optional[str] = None
    project_id: str
    team_id: Optional[str] = None
    user_id: str
    user_name: str
    content: str
    parent_comment_id: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

class Notification(BaseModel):
    id: Optional[str] = None
    user_id: str
    notification_type: NotificationType
    title: str
    message: str
    project_id: Optional[str] = None
    team_id: Optional[str] = None
    read: bool = False
    created_at: datetime

class CollaborationSummary(BaseModel):
    project_id: str
    feedback_count: int
    average_rating: float
    approval_requests: List[ApprovalRequest]
    recent_comments: List[Comment]
    unread_notifications: int
    overall_satisfaction: float 