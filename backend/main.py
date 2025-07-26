from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

# Initialize FastAPI app
app = FastAPI()

# CORS middleware - Production ready
allowed_origins = [origin.strip() for origin in os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:3001").split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
@app.on_event("startup")
async def startup_db_client():
    mongodb_url = os.getenv("MONGODB_URL")
    if not mongodb_url:
        raise RuntimeError("MONGODB_URL environment variable not set!")
    app.mongodb_client = AsyncIOMotorClient(mongodb_url)
    app.mongodb = app.mongodb_client.team_optimizer

@app.on_event("shutdown")
async def shutdown_db_client():
    app.mongodb_client.close()

# Include routers
try:
    from auth.routes import router as auth_router
    app.include_router(auth_router, prefix="/auth", tags=["Authentication"])
except ImportError:
    pass

try:
    from employees.routes import router as employees_router
    app.include_router(employees_router, prefix="/employees", tags=["Employees"])
except ImportError:
    pass

try:
    from projects.routes import router as projects_router
    app.include_router(projects_router, prefix="/projects", tags=["Projects"])
except ImportError:
    pass

try:
    from optimization.routes_simple import router as optimization_router
    app.include_router(optimization_router, prefix="/optimize", tags=["Optimization"])
except ImportError:
    pass

try:
    from analytics.routes import router as analytics_router
    app.include_router(analytics_router, prefix="/analytics", tags=["Analytics"])
except ImportError:
    pass

try:
    from collaboration.routes import router as collaboration_router
    app.include_router(collaboration_router, prefix="/collaboration", tags=["Collaboration"])
except ImportError:
    pass

@app.get("/")
async def root():
    return {"message": "TeamOptimizer API is running"}

@app.get("/test")
async def test():
    return {"message": "Test endpoint working", "status": "ok"} 
