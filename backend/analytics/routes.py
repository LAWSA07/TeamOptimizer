from fastapi import APIRouter, HTTPException, Request
from .models import (
    TeamAnalytics, SkillGapAnalysis, PerformanceMetrics, 
    AnalyticsSummary, SkillCoverage, DiversityMetrics
)
from bson import ObjectId
from datetime import datetime
from typing import List, Dict
import re

router = APIRouter()

def analyze_skill_coverage(employees: List[Dict], required_skills: List[str]) -> List[SkillCoverage]:
    """Analyze skill coverage across employees"""
    skill_coverage = []
    total_employees = len(employees)
    
    for skill in required_skills:
        employees_with_skill = 0
        for emp in employees:
            emp_skills = [s.get("name", "").lower() for s in emp.get("skills", [])]
            if skill.lower() in emp_skills:
                employees_with_skill += 1
        
        coverage_percentage = (employees_with_skill / total_employees * 100) if total_employees > 0 else 0
        skill_coverage.append(SkillCoverage(
            skill=skill,
            coverage_percentage=round(coverage_percentage, 2),
            employees_with_skill=employees_with_skill,
            total_employees=total_employees
        ))
    
    return skill_coverage

def analyze_diversity(employees: List[Dict]) -> DiversityMetrics:
    """Analyze diversity metrics across employees"""
    gender_dist = {"male": 0, "female": 0, "other": 0}
    seniority_dist = {"junior": 0, "mid": 0, "senior": 0}
    department_dist = {}
    
    for emp in employees:
        # Gender distribution
        gender = (emp.get("gender") or "other").lower()
        if gender in gender_dist:
            gender_dist[gender] += 1
        
        # Seniority distribution
        emp_skills = emp.get("skills", [])
        for skill in emp_skills:
            level = (skill.get("level") or "").lower()
            if level in seniority_dist:
                seniority_dist[level] += 1
        
        # Department distribution
        dept = emp.get("department", "Unknown")
        department_dist[dept] = department_dist.get(dept, 0) + 1
    
    return DiversityMetrics(
        gender_distribution=gender_dist,
        seniority_distribution=seniority_dist,
        department_distribution=department_dist
    )

def identify_skill_gaps(employees: List[Dict], required_skills: List[str]) -> SkillGapAnalysis:
    """Identify skill gaps and provide recommendations"""
    missing_skills = []
    critical_gaps = []
    training_recommendations = []
    hiring_recommendations = []
    
    # Analyze each required skill
    for skill in required_skills:
        employees_with_skill = 0
        for emp in employees:
            emp_skills = [s.get("name", "").lower() for s in emp.get("skills", [])]
            if skill.lower() in emp_skills:
                employees_with_skill += 1
        
        if employees_with_skill == 0:
            missing_skills.append(skill)
            critical_gaps.append(skill)
            hiring_recommendations.append(f"Hire {skill} specialist")
        elif employees_with_skill < 2:
            missing_skills.append(skill)
            training_recommendations.append(f"Train existing employees in {skill}")
    
    return SkillGapAnalysis(
        missing_skills=missing_skills,
        critical_gaps=critical_gaps,
        training_recommendations=training_recommendations,
        hiring_recommendations=hiring_recommendations
    )

async def calculate_performance_metrics(request: Request) -> PerformanceMetrics:
    """Calculate performance metrics from audit logs"""
    db = request.app.mongodb["audit_logs"]
    
    # Get optimization logs
    optimization_logs = await db.find({"action": "optimize"}).to_list(1000)
    total_optimizations = len(optimization_logs)
    
    # Calculate success rate (simplified - assume all optimizations are successful)
    successful_optimizations = total_optimizations
    
    # Calculate average team score (simplified)
    average_team_score = 0.85  # Placeholder
    
    # Calculate constraint satisfaction rate
    constraint_satisfaction_rate = 0.92  # Placeholder
    
    # Calculate diversity score
    diversity_score = 0.78  # Placeholder
    
    return PerformanceMetrics(
        optimization_success_rate=round((successful_optimizations / total_optimizations * 100) if total_optimizations > 0 else 0, 2),
        average_team_score=round(average_team_score, 2),
        constraint_satisfaction_rate=round(constraint_satisfaction_rate, 2),
        diversity_score=round(diversity_score, 2),
        total_optimizations=total_optimizations,
        successful_optimizations=successful_optimizations
    )

@router.get("/team/{project_id}", response_model=TeamAnalytics)
async def get_team_analytics(project_id: str, request: Request):
    """Get comprehensive analytics for a specific project/team"""
    db_projects = request.app.mongodb["projects"]
    db_employees = request.app.mongodb["employees"]
    
    # Fetch project
    project = await db_projects.find_one({"_id": ObjectId(project_id)})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Get required skills from project roles
    required_roles = [r["role"].strip() for r in project.get("required_roles", []) if r.get("role")]
    required_skills = required_roles  # Simplified - using roles as skills
    
    # Fetch all employees
    employees = await db_employees.find().to_list(1000)
    
    # Analyze skill coverage
    skill_coverage = analyze_skill_coverage(employees, required_skills)
    
    # Analyze diversity
    diversity_metrics = analyze_diversity(employees)
    
    # Calculate overall score
    avg_coverage = sum(sc.coverage_percentage for sc in skill_coverage) / len(skill_coverage) if skill_coverage else 0
    overall_score = round(avg_coverage / 100, 2)
    
    # Identify skill gaps
    skill_gaps = [sc.skill for sc in skill_coverage if sc.coverage_percentage < 50]
    
    # Generate recommendations
    recommendations = []
    if overall_score < 0.7:
        recommendations.append("Consider hiring additional team members with required skills")
    if diversity_metrics.gender_distribution.get("female", 0) < 2:
        recommendations.append("Consider improving gender diversity in team composition")
    if not skill_gaps:
        recommendations.append("Team has good skill coverage for this project")
    
    return TeamAnalytics(
        team_id=project_id,
        skill_coverage=skill_coverage,
        diversity_metrics=diversity_metrics,
        overall_score=overall_score,
        skill_gaps=skill_gaps,
        recommendations=recommendations
    )

@router.get("/skill-gaps/{project_id}", response_model=SkillGapAnalysis)
async def get_skill_gap_analysis(project_id: str, request: Request):
    """Get detailed skill gap analysis for a project"""
    db_projects = request.app.mongodb["projects"]
    db_employees = request.app.mongodb["employees"]
    
    # Fetch project
    project = await db_projects.find_one({"_id": ObjectId(project_id)})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Get required skills
    required_roles = [r["role"].strip() for r in project.get("required_roles", []) if r.get("role")]
    required_skills = required_roles
    
    # Fetch all employees
    employees = await db_employees.find().to_list(1000)
    
    # Analyze skill gaps
    return identify_skill_gaps(employees, required_skills)

@router.get("/performance", response_model=PerformanceMetrics)
async def get_performance_metrics(request: Request):
    """Get overall performance metrics"""
    return await calculate_performance_metrics(request)

@router.get("/summary/{project_id}", response_model=AnalyticsSummary)
async def get_analytics_summary(project_id: str, request: Request):
    """Get comprehensive analytics summary for a project"""
    team_analytics = await get_team_analytics(project_id, request)
    skill_gap_analysis = await get_skill_gap_analysis(project_id, request)
    performance_metrics = await calculate_performance_metrics(request)
    
    return AnalyticsSummary(
        team_analytics=team_analytics,
        skill_gap_analysis=skill_gap_analysis,
        performance_metrics=performance_metrics,
        generated_at=datetime.utcnow()
    ) 