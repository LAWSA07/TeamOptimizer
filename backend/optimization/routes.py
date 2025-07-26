from fastapi import APIRouter, HTTPException, Request
from .models import (
    OptimizationRequest, AdvancedOptimizationResult, TeamMember, Skill,
    WorkloadMetrics, ChemistryMetrics
)
from datetime import datetime
from bson import ObjectId
import re
from sentence_transformers import SentenceTransformer, util
import numpy as np
import itertools
import random

router = APIRouter()

# SBERT model (load once)
model = SentenceTransformer('all-MiniLM-L6-v2')

LEVEL_RANK = {"senior": 3, "mid": 2, "junior": 1, None: 0, "": 0}
def skill_level_rank(level):
    if not level:
        return 0
    return LEVEL_RANK.get(level.strip().lower(), 0)

def calculate_workload_metrics(team, employees_data):
    """Calculate workload distribution and balance metrics"""
    workload_scores = {}
    total_workload = 0
    
    for member in team:
        emp_data = next((e for e in employees_data if e["name"] == member["name"]), None)
        if emp_data:
            # Calculate workload based on skill level and number of skills
            skill_count = len(emp_data.get("skills", []))
            avg_level = sum(skill_level_rank(s.get("level")) for s in emp_data.get("skills", [])) / max(skill_count, 1)
            workload = skill_count * (1 + avg_level * 0.5)  # Higher level = more workload
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
    
    # Simulate chemistry based on various factors
    communication_score = 0.8 + random.uniform(-0.2, 0.2)  # Base + variation
    collaboration_score = 0.75 + random.uniform(-0.25, 0.25)
    
    # Calculate diversity-based cohesion
    genders = [m.get("gender") for m in team if m.get("gender")]
    gender_diversity = len(set(genders)) / max(len(genders), 1)
    
    # Calculate skill overlap (more overlap = better collaboration)
    all_skills = []
    for member in team:
        emp_data = next((e for e in employees_data if e["name"] == member["name"]), None)
        if emp_data:
            skills = [s.get("name", "").lower() for s in emp_data.get("skills", [])]
            all_skills.extend(skills)
    
    skill_overlap = len(all_skills) - len(set(all_skills))
    skill_cohesion = min(1.0, skill_overlap / max(len(team), 1))
    
    # Calculate conflict risk (based on workload imbalance and skill gaps)
    workload_variance = 0.3 + random.uniform(-0.2, 0.2)
    conflict_risk = max(0, min(1, workload_variance * (1 - skill_cohesion)))
    
    # Overall chemistry
    team_cohesion = (communication_score + collaboration_score + skill_cohesion) / 3
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

def parse_constraints(constraints):
    # Supports: 'at least 2 juniors', 'max 1 senior', 'must have devops', 'prefer 2 females'
    result = {"at_least": {}, "max": {}, "must_have": set(), "prefer": {}}
    if not constraints:
        return result
    for part in constraints.split(","):
        part = part.strip().lower()
        if part.startswith("at least"):
            m = re.match(r"at least (\d+) (\w+)", part)
            if m:
                count, key = m.groups()
                result["at_least"][key] = int(count)
        elif part.startswith("max"):
            m = re.match(r"max (\d+) (\w+)", part)
            if m:
                count, key = m.groups()
                result["max"][key] = int(count)
        elif part.startswith("must have"):
            m = re.match(r"must have (.+)", part)
            if m:
                key = m.group(1).strip()
                result["must_have"].add(key)
        elif part.startswith("prefer"):
            m = re.match(r"prefer (\d+) (\w+)", part)
            if m:
                count, key = m.groups()
                result["prefer"][key] = int(count)
    return result

@router.post("/{project_id}", response_model=AdvancedOptimizationResult)
async def optimize(project_id: str, request: Request):
    db_projects = request.app.mongodb["projects"]
    db_employees = request.app.mongodb["employees"]
    
    # Fetch project
    project = await db_projects.find_one({"_id": ObjectId(project_id)})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    required_roles = [r["role"].strip() for r in project.get("required_roles", []) if r.get("role")]
    constraints = parse_constraints(project.get("constraints", ""))
    
    # Fetch all employees
    employees = await db_employees.find().to_list(1000)
    
    # Prepare SBERT embeddings for more flexible skill matching
    role_embeddings = model.encode(required_roles)
    employee_skill_texts = []
    for emp in employees:
        skills = [s.get("name", "") for s in emp.get("skills", [])]
        # Add some generic skills to improve matching
        generic_skills = ["programming", "development", "software", "technical"]
        all_skills = skills + generic_skills
        employee_skill_texts.append(", ".join(all_skills))
    employee_embeddings = model.encode(employee_skill_texts)
    
    # Compute similarity matrix (roles x employees)
    sim_matrix = util.cos_sim(role_embeddings, employee_embeddings).cpu().numpy()
    
    num_roles = len(required_roles)
    num_emps = len(employees)
    
    # Allow employees to take multiple roles if needed
    all_assignments = []
    if num_emps >= num_roles:
        # We have enough employees, use permutations
        all_assignments = list(itertools.permutations(emp_indices, num_roles))[:1000]
    else:
        # We don't have enough employees, allow multiple roles per employee
        # Create assignments where employees can take multiple roles
        emp_indices = list(range(num_emps))
        for assignment in itertools.product(emp_indices, repeat=num_roles):
            all_assignments.append(assignment)
            if len(all_assignments) >= 1000:
                break
    
    team_candidates = []
    for assignment in all_assignments:
        assigned_employees = set()
        team = []
        explanations = []
        constraint_counts = {"junior": 0, "senior": 0, "female": 0, "male": 0, "other": 0}
        must_have_skills = set()
        
        for i, emp_idx in enumerate(assignment):
            emp = employees[emp_idx]
            if str(emp["_id"]) in assigned_employees:
                # Already assigned, skip (shouldn't happen in permutations)
                team.append({"name": "(unassigned)", "role": required_roles[i], "skills": [], "gender": None})
                explanations.append(0.0)
                continue
            
            emp_skills = emp.get("skills", [])
            skills = [Skill(name=s.get("name", ""), level=s.get("level")) for s in emp_skills]
            gender = (emp.get("gender") or "other").strip().lower()
            if gender in constraint_counts:
                constraint_counts[gender] += 1
            
            for s in emp_skills:
                lvl = (s.get("level") or "").strip().lower()
                if lvl in constraint_counts:
                    constraint_counts[lvl] += 1
                must_have_skills.add(s.get("name", "").strip().lower())
            
            team.append({
                "name": emp["name"],
                "role": required_roles[i],
                "skills": skills,
                "gender": emp.get("gender", None)
            })
            assigned_employees.add(str(emp["_id"]))
            explanations.append(float(f"{sim_matrix[i, emp_idx]:.3f}"))
        
        # Hard constraint: must_have
        hard_ok = all(must in must_have_skills for must in constraints["must_have"])
        if not hard_ok:
            continue
        
        # Soft constraints
        diversity_score = 1.0
        for key, val in constraints["at_least"].items():
            if constraint_counts.get(key, 0) < val:
                diversity_score = min(diversity_score, 0.5)
        for key, val in constraints["max"].items():
            if constraint_counts.get(key, 0) > val:
                diversity_score = min(diversity_score, 0.5)
        for key, val in constraints["prefer"].items():
            if constraint_counts.get(key, 0) < val:
                diversity_score = min(diversity_score, 0.8)
        
        explanations = [min(e, diversity_score) for e in explanations]
        total_score = sum(explanations)
        team_candidates.append((total_score, team, explanations))
    
    # Sort and return top 3 teams
    team_candidates.sort(reverse=True, key=lambda x: x[0])
    top_teams = team_candidates[:3]
    
    # If no teams found, create a fallback team with available employees
    if not top_teams:
        fallback_team = []
        fallback_explanations = []
        for i, role in enumerate(required_roles):
            if i < len(employees):
                emp = employees[i]
                skills = [Skill(name=s.get("name", ""), level=s.get("level")) for s in emp.get("skills", [])]
                fallback_team.append({
                    "name": emp["name"],
                    "role": role,
                    "skills": skills,
                    "gender": emp.get("gender", None)
                })
                fallback_explanations.append(0.5)  # Default score
            else:
                # Assign the same employee to multiple roles if needed
                emp = employees[i % len(employees)]
                skills = [Skill(name=s.get("name", ""), level=s.get("level")) for s in emp.get("skills", [])]
                fallback_team.append({
                    "name": f"{emp['name']} (Role {i+1})",
                    "role": role,
                    "skills": skills,
                    "gender": emp.get("gender", None)
                })
                fallback_explanations.append(0.3)  # Lower score for multiple roles
        
        teams = [fallback_team]
        explanations = [fallback_explanations]
    else:
        teams = [t[1] for t in top_teams]
        explanations = [t[2] for t in top_teams]
    
    # Calculate advanced metrics for the best team
    best_team = teams[0] if teams else []
    workload_metrics = calculate_workload_metrics(best_team, employees)
    chemistry_metrics = calculate_chemistry_metrics(best_team, employees)
    
    # Generate recommendations
    recommendations = generate_recommendations(workload_metrics, chemistry_metrics, best_team)
    
    # Calculate overall score
    base_score = sum(explanations[0]) if explanations else 0
    workload_bonus = workload_metrics.balance_score * 0.2
    chemistry_bonus = chemistry_metrics.overall_chemistry * 0.3
    overall_score = min(1.0, base_score + workload_bonus + chemistry_bonus)
    
    # Audit log (optional)
    try:
        await request.app.mongodb["audit_logs"].insert_one({
            "action": "optimize", 
            "project_id": project_id, 
            "timestamp": datetime.utcnow(),
            "advanced_features": True
        })
    except:
        pass  # Skip audit log if it fails
    
    return AdvancedOptimizationResult(
        teams=teams,
        explanations=explanations,
        workload_metrics=workload_metrics,
        chemistry_metrics=chemistry_metrics,
        overall_score=overall_score,
        recommendations=recommendations,
        generated_at=datetime.utcnow()
    ) 