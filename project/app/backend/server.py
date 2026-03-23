from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext
from jose import JWTError, jwt
import os
import logging
from pathlib import Path
import uuid
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'test_database')]

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()
JWT_SECRET = os.environ.get('JWT_SECRET', 'jobspark_secret_key_2026_secure_token')
JWT_ALGORITHM = os.environ.get('JWT_ALGORITHM', 'HS256')
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY', '')

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# ============ MODELS ============

class UserRegister(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    mobile: str
    education: Optional[str] = None
    skills: Optional[List[str]] = []
    experience: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserProfile(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    full_name: str
    email: str
    mobile: str
    education: Optional[str] = None
    skills: List[str] = []
    experience: Optional[str] = None
    certifications: List[str] = []
    projects: List[Dict[str, str]] = []
    interests: List[str] = []
    resume_url: Optional[str] = None
    profile_completion: float = 0.0
    created_at: str

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    mobile: Optional[str] = None
    education: Optional[str] = None
    skills: Optional[List[str]] = None
    experience: Optional[str] = None
    certifications: Optional[List[str]] = None
    projects: Optional[List[Dict[str, str]]] = None
    interests: Optional[List[str]] = None
    resume_url: Optional[str] = None

class Job(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    title: str
    company: str
    location: str
    job_type: str
    experience_required: str
    salary: Optional[str] = None
    description: str
    skills_required: List[str]
    external_url: str
    posted_date: str
    category: str

class Application(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    user_id: str
    job_id: str
    job_title: str
    company: str
    applied_date: str
    status: str
    external_url: str

class ApplicationCreate(BaseModel):
    job_id: str

class ChatMessageRequest(BaseModel):
    message: str
    session_id: Optional[str] = None

class ChatMessageResponse(BaseModel):
    response: str
    session_id: str

# ============ HELPER FUNCTIONS ============

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(days=7)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
        return user_id
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")

def calculate_profile_completion(user_data: dict) -> float:
    fields = ['full_name', 'email', 'mobile', 'education', 'skills', 'experience', 'resume_url']
    completed = 0
    for field in fields:
        if field in user_data and user_data[field]:
            if isinstance(user_data[field], list):
                if len(user_data[field]) > 0:
                    completed += 1
            else:
                completed += 1
    return round((completed / len(fields)) * 100, 2)

# ============ MOCK JOB DATA ============

MOCK_JOBS = [
    {
        "id": "job1",
        "title": "Full Stack Developer",
        "company": "TechCorp Inc",
        "location": "Remote",
        "job_type": "Full-time",
        "experience_required": "2-4 years",
        "salary": "$80,000 - $120,000",
        "description": "Build scalable web applications using React and Node.js. Work with a talented team on cutting-edge projects.",
        "skills_required": ["React", "Node.js", "MongoDB", "JavaScript", "TypeScript"],
        "external_url": "https://example.com/jobs/fullstack-dev",
        "posted_date": datetime.now(timezone.utc).isoformat(),
        "category": "job"
    },
    {
        "id": "job2",
        "title": "Python Developer Intern",
        "company": "StartupHub",
        "location": "Bangalore, India",
        "job_type": "Internship",
        "experience_required": "0-1 years",
        "salary": "₹15,000 - ₹25,000/month",
        "description": "Learn and grow with us while building backend services using Python and FastAPI.",
        "skills_required": ["Python", "FastAPI", "SQL", "Git"],
        "external_url": "https://example.com/internships/python-intern",
        "posted_date": datetime.now(timezone.utc).isoformat(),
        "category": "internship"
    },
    {
        "id": "job3",
        "title": "Data Scientist",
        "company": "AI Solutions Ltd",
        "location": "New York, USA",
        "job_type": "Full-time",
        "experience_required": "3-5 years",
        "salary": "$100,000 - $150,000",
        "description": "Analyze large datasets and build ML models to drive business insights.",
        "skills_required": ["Python", "Machine Learning", "TensorFlow", "Pandas", "SQL"],
        "external_url": "https://example.com/jobs/data-scientist",
        "posted_date": datetime.now(timezone.utc).isoformat(),
        "category": "job"
    },
    {
        "id": "job4",
        "title": "Frontend Developer",
        "company": "Design Co",
        "location": "San Francisco, USA",
        "job_type": "Contract",
        "experience_required": "1-3 years",
        "salary": "$70,000 - $90,000",
        "description": "Create beautiful, responsive user interfaces with React and modern CSS.",
        "skills_required": ["React", "CSS", "JavaScript", "HTML", "Tailwind CSS"],
        "external_url": "https://example.com/jobs/frontend-dev",
        "posted_date": datetime.now(timezone.utc).isoformat(),
        "category": "job"
    },
    {
        "id": "course1",
        "title": "AWS Certified Solutions Architect Course",
        "company": "Udemy",
        "location": "Online",
        "job_type": "Course",
        "experience_required": "Beginner",
        "salary": "$99.99",
        "description": "Master AWS services and prepare for the Solutions Architect certification.",
        "skills_required": ["AWS", "Cloud Computing", "DevOps"],
        "external_url": "https://example.com/courses/aws-architect",
        "posted_date": datetime.now(timezone.utc).isoformat(),
        "category": "course"
    },
    {
        "id": "course2",
        "title": "Advanced JavaScript Masterclass",
        "company": "Coursera",
        "location": "Online",
        "job_type": "Course",
        "experience_required": "Intermediate",
        "salary": "$49.99",
        "description": "Deep dive into JavaScript concepts including closures, async programming, and design patterns.",
        "skills_required": ["JavaScript", "Web Development"],
        "external_url": "https://example.com/courses/js-masterclass",
        "posted_date": datetime.now(timezone.utc).isoformat(),
        "category": "course"
    },
    {
        "id": "intern1",
        "title": "UI/UX Design Intern",
        "company": "Creative Studio",
        "location": "Remote",
        "job_type": "Internship",
        "experience_required": "0 years",
        "salary": "Unpaid/Stipend",
        "description": "Work on real client projects and learn from experienced designers.",
        "skills_required": ["Figma", "UI/UX Design", "Adobe XD"],
        "external_url": "https://example.com/internships/uiux-intern",
        "posted_date": datetime.now(timezone.utc).isoformat(),
        "category": "internship"
    },
    {
        "id": "job5",
        "title": "DevOps Engineer",
        "company": "CloudTech Systems",
        "location": "Austin, USA",
        "job_type": "Full-time",
        "experience_required": "3-5 years",
        "salary": "$90,000 - $130,000",
        "description": "Manage CI/CD pipelines, containerization, and cloud infrastructure.",
        "skills_required": ["Docker", "Kubernetes", "AWS", "Jenkins", "Linux"],
        "external_url": "https://example.com/jobs/devops-engineer",
        "posted_date": datetime.now(timezone.utc).isoformat(),
        "category": "job"
    }
]

# ============ AUTH ROUTES ============

@api_router.post("/auth/register")
async def register(user: UserRegister):
    # Check if user exists
    existing_user = await db.users.find_one({"email": user.email}, {"_id": 0})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user_id = str(uuid.uuid4())
    user_data = {
        "id": user_id,
        "full_name": user.full_name,
        "email": user.email,
        "password": hash_password(user.password),
        "mobile": user.mobile,
        "education": user.education,
        "skills": user.skills or [],
        "experience": user.experience,
        "certifications": [],
        "projects": [],
        "interests": [],
        "resume_url": None,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    user_data['profile_completion'] = calculate_profile_completion(user_data)
    
    await db.users.insert_one(user_data)
    
    # Create token
    access_token = create_access_token(data={"sub": user_id})
    
    return {
        "message": "Registration successful",
        "token": access_token,
        "user_id": user_id
    }

@api_router.post("/auth/login")
async def login(user: UserLogin):
    # Find user
    db_user = await db.users.find_one({"email": user.email}, {"_id": 0})
    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Verify password
    if not verify_password(user.password, db_user['password']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Create token
    access_token = create_access_token(data={"sub": db_user['id']})
    
    return {
        "message": "Login successful",
        "token": access_token,
        "user_id": db_user['id']
    }

# ============ PROFILE ROUTES ============

@api_router.get("/profile", response_model=UserProfile)
async def get_profile(user_id: str = Depends(get_current_user)):
    user = await db.users.find_one({"id": user_id}, {"_id": 0, "password": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@api_router.put("/profile")
async def update_profile(profile: ProfileUpdate, user_id: str = Depends(get_current_user)):
    update_data = {k: v for k, v in profile.model_dump().items() if v is not None}
    
    if update_data:
        await db.users.update_one({"id": user_id}, {"$set": update_data})
        
        # Recalculate profile completion
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
        completion = calculate_profile_completion(user)
        await db.users.update_one({"id": user_id}, {"$set": {"profile_completion": completion}})
    
    return {"message": "Profile updated successfully"}

@api_router.get("/profile/completion")
async def get_profile_completion(user_id: str = Depends(get_current_user)):
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    completion = calculate_profile_completion(user)
    return {"completion": completion}

# ============ JOB ROUTES ============

@api_router.get("/jobs", response_model=List[Job])
async def get_jobs(user_id: str = Depends(get_current_user)):
    # Get user skills for recommendations
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    user_skills = set(skill.lower() for skill in user.get('skills', []))
    
    # Score jobs based on skill match
    scored_jobs = []
    for job in MOCK_JOBS:
        job_skills = set(skill.lower() for skill in job['skills_required'])
        match_score = len(user_skills.intersection(job_skills))
        scored_jobs.append((match_score, job))
    
    # Sort by match score
    scored_jobs.sort(key=lambda x: x[0], reverse=True)
    return [job for _, job in scored_jobs]

@api_router.get("/jobs/search")
async def search_jobs(
    keyword: Optional[str] = None,
    location: Optional[str] = None,
    job_type: Optional[str] = None,
    user_id: str = Depends(get_current_user)
):
    filtered_jobs = MOCK_JOBS.copy()
    
    if keyword:
        keyword_lower = keyword.lower()
        filtered_jobs = [
            job for job in filtered_jobs
            if keyword_lower in job['title'].lower() or 
               keyword_lower in job['description'].lower() or
               any(keyword_lower in skill.lower() for skill in job['skills_required'])
        ]
    
    if location:
        filtered_jobs = [
            job for job in filtered_jobs
            if location.lower() in job['location'].lower()
        ]
    
    if job_type:
        filtered_jobs = [
            job for job in filtered_jobs
            if job_type.lower() == job['category'].lower()
        ]
    
    return filtered_jobs

@api_router.get("/jobs/{job_id}", response_model=Job)
async def get_job(job_id: str, user_id: str = Depends(get_current_user)):
    job = next((j for j in MOCK_JOBS if j['id'] == job_id), None)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

# ============ APPLICATION ROUTES ============

@api_router.post("/applications")
async def create_application(application: ApplicationCreate, user_id: str = Depends(get_current_user)):
    # Check profile completion
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if calculate_profile_completion(user) < 50:
        raise HTTPException(
            status_code=400,
            detail="Profile must be at least 50% complete to apply for jobs"
        )
    
    # Check if already applied
    existing_app = await db.applications.find_one(
        {"user_id": user_id, "job_id": application.job_id},
        {"_id": 0}
    )
    if existing_app:
        raise HTTPException(status_code=400, detail="Already applied to this job")
    
    # Get job details
    job = next((j for j in MOCK_JOBS if j['id'] == application.job_id), None)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Create application
    app_id = str(uuid.uuid4())
    app_data = {
        "id": app_id,
        "user_id": user_id,
        "job_id": application.job_id,
        "job_title": job['title'],
        "company": job['company'],
        "applied_date": datetime.now(timezone.utc).isoformat(),
        "status": "Applied",
        "external_url": job['external_url']
    }
    
    await db.applications.insert_one(app_data)
    
    return {
        "message": "Application submitted successfully",
        "application_id": app_id,
        "redirect_url": job['external_url']
    }

@api_router.get("/applications", response_model=List[Application])
async def get_applications(user_id: str = Depends(get_current_user)):
    applications = await db.applications.find({"user_id": user_id}, {"_id": 0}).to_list(1000)
    return applications

@api_router.patch("/applications/{application_id}/status")
async def update_application_status(
    application_id: str,
    status: str,
    user_id: str = Depends(get_current_user)
):
    result = await db.applications.update_one(
        {"id": application_id, "user_id": user_id},
        {"$set": {"status": status}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Application not found")
    
    return {"message": "Application status updated"}

# ============ CHAT ROUTES ============

@api_router.post("/chat/message", response_model=ChatMessageResponse)
async def chat_message(chat_req: ChatMessageRequest, user_id: str = Depends(get_current_user)):
    # Get user profile for context
    user = await db.users.find_one({"id": user_id}, {"_id": 0, "password": 0})
    
    # Create system message with user context
    system_message = f"""You are JobSpark AI, a helpful career assistant. You help users with:
    - Job recommendations based on their skills and experience
    - Resume building and ATS optimization tips
    - Career guidance and skill development suggestions
    - Profile improvement recommendations
    
    User Profile Context:
    - Name: {user.get('full_name', 'N/A')}
    - Skills: {', '.join(user.get('skills', [])) or 'Not specified'}
    - Education: {user.get('education', 'Not specified')}
    - Experience: {user.get('experience', 'Not specified')}
    - Profile Completion: {user.get('profile_completion', 0)}%
    
    Be helpful, professional, and provide actionable advice."""
    
    # Initialize chat
    session_id = chat_req.session_id or str(uuid.uuid4())
    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=session_id,
        system_message=system_message
    ).with_model("openai", "gpt-4o")
    
    # Send message
    user_message = UserMessage(text=chat_req.message)
    response = await chat.send_message(user_message)
    
    # Store in database
    chat_data = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "session_id": session_id,
        "message": chat_req.message,
        "response": response,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    await db.chat_messages.insert_one(chat_data)
    
    return ChatMessageResponse(response=response, session_id=session_id)

@api_router.get("/chat/history")
async def get_chat_history(user_id: str = Depends(get_current_user), session_id: Optional[str] = None):
    query = {"user_id": user_id}
    if session_id:
        query["session_id"] = session_id
    
    messages = await db.chat_messages.find(query, {"_id": 0}).sort("timestamp", 1).to_list(1000)
    return messages

# ============ RESUME ROUTES ============

@api_router.post("/resume/suggestions")
async def get_resume_suggestions(user_id: str = Depends(get_current_user)):
    user = await db.users.find_one({"id": user_id}, {"_id": 0, "password": 0})
    
    # Use AI to suggest improvements
    system_message = "You are a resume expert. Provide concise, actionable suggestions to improve this profile for ATS systems."
    
    user_context = f"""User Profile:
    - Skills: {', '.join(user.get('skills', []))}
    - Education: {user.get('education', 'Not specified')}
    - Experience: {user.get('experience', 'Not specified')}
    - Certifications: {', '.join(user.get('certifications', []))}
    
    Provide 3-5 specific suggestions to improve their resume for ATS systems."""
    
    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=str(uuid.uuid4()),
        system_message=system_message
    ).with_model("openai", "gpt-4o")
    
    user_message = UserMessage(text=user_context)
    suggestions = await chat.send_message(user_message)
    
    return {"suggestions": suggestions}

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()