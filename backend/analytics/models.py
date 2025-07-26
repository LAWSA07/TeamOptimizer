from pydantic import BaseModel
from typing import List, Dict, Optional
from datetime import datetime

class SkillCoverage(BaseModel):
    skill: str
    coverage_percentage: float
    employees_with_skill: int
    total_employees: int

class DiversityMetrics(BaseModel):
    gender_distribution: Dict[str, int]
    seniority_distribution: Dict[str, int]
    department_distribution: Dict[str, int]

class TeamAnalytics(BaseModel):
    team_id: str
    skill_coverage: List[SkillCoverage]
    diversity_metrics: DiversityMetrics
    overall_score: float
    skill_gaps: List[str]
    recommendations: List[str]

class SkillGapAnalysis(BaseModel):
    missing_skills: List[str]
    critical_gaps: List[str]
    training_recommendations: List[str]
    hiring_recommendations: List[str]

class PerformanceMetrics(BaseModel):
    optimization_success_rate: float
    average_team_score: float
    constraint_satisfaction_rate: float
    diversity_score: float
    total_optimizations: int
    successful_optimizations: int

class AnalyticsSummary(BaseModel):
    team_analytics: TeamAnalytics
    skill_gap_analysis: SkillGapAnalysis
    performance_metrics: PerformanceMetrics
    generated_at: datetime 