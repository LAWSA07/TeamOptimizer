from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime

class Skill(BaseModel):
    name: str
    level: Optional[str] = None

class TeamMember(BaseModel):
    name: str
    role: str
    skills: List[Skill]
    gender: Optional[str] = None
    workload_score: Optional[float] = None
    chemistry_score: Optional[float] = None

class WorkloadMetrics(BaseModel):
    total_workload: float
    workload_distribution: Dict[str, float]
    balance_score: float
    overloaded_members: List[str]
    underutilized_members: List[str]

class ChemistryMetrics(BaseModel):
    overall_chemistry: float
    communication_score: float
    collaboration_score: float
    conflict_risk: float
    team_cohesion: float

class AdvancedOptimizationResult(BaseModel):
    teams: List[List[TeamMember]]
    explanations: List[List[float]]
    workload_metrics: WorkloadMetrics
    chemistry_metrics: ChemistryMetrics
    overall_score: float
    recommendations: List[str]
    generated_at: datetime

class OptimizationRequest(BaseModel):
    project_id: str
    enable_workload_balancing: bool = True
    enable_chemistry_scoring: bool = True
    workload_weights: Dict[str, float] = {}
    chemistry_weights: Dict[str, float] = {} 