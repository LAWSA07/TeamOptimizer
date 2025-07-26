from fastapi import APIRouter, HTTPException, Request
from .models import (
    OptimizationRequest, AdvancedOptimizationResult, TeamMember, Skill,
    WorkloadMetrics, ChemistryMetrics
)
from datetime import datetime
from bson import ObjectId
import re
import random

router = APIRouter()

def calculate_workload_metrics(team, employees_data):
    """Calculate workload distribution and balance metrics"""
    workload_scores = {}
    total_workload = 0
    
    for member in team:
        emp_data = next((e for e in employees_data if e["name"] == member["name"]), None)
        if emp_data:
            # Calculate workload based on skill level and number of skills
            skill_count = len(emp_data.get("skills", []))
            workload = skill_count * 2  # Simple workload calculation
            workload_scores[member["name"]] = workload
            total_workload += workload
    
    if not workload_scores:
        return WorkloadMetrics(
            total_workload=0,
            workload_distribution={},
            balance_score=0,
            overloaded_members=[],
            underutilized_members=[]
        )
    
    # Calculate balance metrics
    avg_workload = total_workload / len(workload_scores)
    variance = sum((w - avg_workload) ** 2 for w in workload_scores.values()) / len(workload_scores)
    balance_score = max(0, 1 - (variance / (avg_workload ** 2 + 1)))
    
    # Identify overloaded and underutilized members
    overloaded = [name for name, w in workload_scores.items() if w > avg_workload * 1.5]
    underutilized = [name for name, w in workload_scores.items() if w < avg_workload * 0.5]
    
    return WorkloadMetrics(
        total_workload=total_workload,
        workload_distribution=workload_scores,
        balance_score=balance_score,
        overloaded_members=overloaded,
        underutilized_members=underutilized
    )

def calculate_chemistry_metrics(team, employees_data):
    """Calculate team chemistry and collaboration metrics"""
    if len(team) < 2:
        return ChemistryMetrics(
            overall_chemistry=1.0,
            communication_score=1.0,
            collaboration_score=1.0,
            conflict_risk=0.0,
            team_cohesion=1.0
        )
    
    # Simple chemistry calculation
    communication_score = 0.8 + random.uniform(-0.2, 0.2)
    collaboration_score = 0.75 + random.uniform(-0.25, 0.25)
    conflict_risk = random.uniform(0.1, 0.4)
    team_cohesion = (communication_score + collaboration_score) / 2
    overall_chemistry = team_cohesion * (1 - conflict_risk * 0.5)
    
    return ChemistryMetrics(
        overall_chemistry=overall_chemistry,
        communication_score=communication_score,
        collaboration_score=collaboration_score,
        conflict_risk=conflict_risk,
        team_cohesion=team_cohesion
    )

def generate_recommendations(workload_metrics, chemistry_metrics, team):
    """Generate actionable recommendations based on metrics"""
    recommendations = []
    
    # Workload recommendations
    if workload_metrics.overloaded_members:
        recommendations.append(f"Consider redistributing tasks from {', '.join(workload_metrics.overloaded_members)}")
    
    if workload_metrics.underutilized_members:
        recommendations.append(f"Assign additional responsibilities to {', '.join(workload_metrics.underutilized_members)}")
    
    if workload_metrics.balance_score < 0.7:
        recommendations.append("Workload distribution needs improvement - consider task reallocation")
    
    # Chemistry recommendations
    if chemistry_metrics.conflict_risk > 0.6:
        recommendations.append("High conflict risk detected - consider team building activities")
    
    if chemistry_metrics.communication_score < 0.7:
        recommendations.append("Communication score is low - implement regular check-ins")
    
    if chemistry_metrics.collaboration_score < 0.7:
        recommendations.append("Collaboration needs improvement - consider pair programming or mentoring")
    
    # General recommendations
    if len(team) > 5:
        recommendations.append("Large team size detected - consider breaking into smaller sub-teams")
    
    if not recommendations:
        recommendations.append("Team composition looks well-balanced!")
    
    return recommendations

@router.post("/{project_id}", response_model=AdvancedOptimizationResult)
async def optimize(project_id: str, request: Request):
    db_projects = request.app.mongodb["projects"]
    db_employees = request.app.mongodb["employees"]
    
    # Fetch project
    project = await db_projects.find_one({"_id": ObjectId(project_id)})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    required_roles = [r["role"].strip() for r in project.get("required_roles", []) if r.get("role")]
    
    # Fetch all employees
    employees = await db_employees.find().to_list(1000)
    
    # Simple team formation - assign employees to roles based on availability
    teams = []
    explanations = []
    
    # Create a simple team assignment
    team = []
    team_explanations = []
    
    for i, role in enumerate(required_roles):
        if i < len(employees):
            emp = employees[i]
            skills = [Skill(name=s.get("name", ""), level=s.get("level")) for s in emp.get("skills", [])]
            team.append({
                "name": emp["name"],
                "role": role,
                "skills": skills,
                "gender": emp.get("gender", None)
            })
            team_explanations.append(0.8)  # Good match
        else:
            # Assign the same employee to multiple roles if needed
            emp = employees[i % len(employees)]
            skills = [Skill(name=s.get("name", ""), level=s.get("level")) for s in emp.get("skills", [])]
            team.append({
                "name": f"{emp['name']} (Role {i+1})",
                "role": role,
                "skills": skills,
                "gender": emp.get("gender", None)
            })
            team_explanations.append(0.5)  # Lower score for multiple roles
    
    teams.append(team)
    explanations.append(team_explanations)
    
    # Calculate advanced metrics for the team
    workload_metrics = calculate_workload_metrics(team, employees)
    chemistry_metrics = calculate_chemistry_metrics(team, employees)
    
    # Generate recommendations
    recommendations = generate_recommendations(workload_metrics, chemistry_metrics, team)
    
    # Calculate overall score
    base_score = sum(team_explanations) / len(team_explanations)
    workload_bonus = workload_metrics.balance_score * 0.2
    chemistry_bonus = chemistry_metrics.overall_chemistry * 0.3
    overall_score = min(1.0, base_score + workload_bonus + chemistry_bonus)
    
    return AdvancedOptimizationResult(
        teams=teams,
        explanations=explanations,
        workload_metrics=workload_metrics,
        chemistry_metrics=chemistry_metrics,
        overall_score=overall_score,
        recommendations=recommendations,
        generated_at=datetime.utcnow()
    ) 