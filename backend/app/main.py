import os
import uuid
from pathlib import Path

from fastapi import Depends, FastAPI, File, HTTPException, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from .config import get_settings
from .db import Base, engine, get_db
from .models import Application, Assessment, AssessmentAttempt, JobOpportunity, Portfolio, Resume, User
from .schemas import (
    ApplicationOut, ApplicationPayload, AssessmentOut, AttemptOut, AttemptPayload,
    AtsOut, AtsRequest, AuthResponse, JobOut, LoginRequest, PortfolioOut,
    PortfolioPayload, ResumeOut, ResumePayload, UserCreate, UserOut,
)
from .security import create_token, get_current_user, hash_password, verify_password


settings = get_settings()
Base.metadata.create_all(bind=engine)
upload_path = Path(settings.upload_dir)
upload_path.mkdir(parents=True, exist_ok=True)

app = FastAPI(title="KVP Orbit API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.mount("/uploads", StaticFiles(directory=upload_path), name="uploads")


def seed_catalog(db: Session) -> None:
    if db.scalar(select(Assessment.id).limit(1)) is None:
        db.add_all([
            Assessment(title="Career foundations", description="Practice the habits behind a focused job search.", duration_minutes=10, questions=[
                {"prompt": "What is the strongest way to describe a project?", "options": ["List tools only", "State the problem, contribution, and outcome", "Use buzzwords", "Copy a job description"], "answer": 1},
                {"prompt": "Which resume detail is most useful to a hiring manager?", "options": ["A measurable result", "A favourite quote", "Every class taken", "An unrelated hobby"], "answer": 0},
                {"prompt": "Before an interview, you should primarily…", "options": ["Memorize an answer script", "Research the role and prepare examples", "Send no questions", "Rewrite your resume"], "answer": 1},
            ]),
            Assessment(title="Workplace communication", description="Check your readiness for clear, professional collaboration.", duration_minutes=8, questions=[
                {"prompt": "A useful status update should include…", "options": ["Only a greeting", "Progress, blockers, and next step", "Every message received", "No dates"], "answer": 1},
                {"prompt": "When receiving feedback, the best first response is…", "options": ["Defend your choice", "Clarify, listen, and agree on a next action", "Ignore it", "Forward it"], "answer": 1},
            ]),
        ])
    if db.scalar(select(JobOpportunity.id).limit(1)) is None:
        db.add_all([
            JobOpportunity(title="Frontend Developer Intern", company="Northstar Labs", location="Bengaluru / Hybrid", employment_type="Internship", description="Build accessible product interfaces with React, TypeScript, and a thoughtful eye for detail.", skills=["React", "TypeScript", "CSS", "Git"], application_url=""),
            JobOpportunity(title="Junior Data Analyst", company="Orbit Analytics", location="Remote", employment_type="Full-time", description="Turn operational data into practical reports and clear recommendations for teams.", skills=["SQL", "Python", "Excel", "Communication"], application_url=""),
            JobOpportunity(title="Product Design Associate", company="Canopy Studio", location="Mumbai / Hybrid", employment_type="Full-time", description="Support research, interaction design, and visual systems for digital products.", skills=["Figma", "User research", "Prototyping", "Communication"], application_url=""),
        ])
    db.commit()


@app.on_event("startup")
def startup() -> None:
    with Session(engine) as db:
        seed_catalog(db)


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "kvp-orbit-api"}


@app.post("/api/auth/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate, db: Session = Depends(get_db)) -> AuthResponse:
    email = payload.email.lower()
    if db.scalar(select(User).where(User.email == email)):
        raise HTTPException(status_code=400, detail="An account with this email already exists")
    user = User(name=payload.name.strip(), email=email, password_hash=hash_password(payload.password))
    db.add(user)
    try:
        db.commit()
        db.refresh(user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="An account with this email already exists") from None
    return AuthResponse(token=create_token(user.id), user=UserOut.model_validate(user))


@app.post("/api/auth/login", response_model=AuthResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> AuthResponse:
    user = db.scalar(select(User).where(User.email == payload.email.lower()))
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    return AuthResponse(token=create_token(user.id), user=UserOut.model_validate(user))


@app.get("/api/auth/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)) -> UserOut:
    return UserOut.model_validate(user)


def resume_out(resume: Resume) -> ResumeOut:
    return ResumeOut.model_validate(resume)


@app.get("/api/resume", response_model=list[ResumeOut])
@app.get("/api/resumes", response_model=list[ResumeOut])
def list_resumes(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> list[ResumeOut]:
    rows = db.scalars(select(Resume).where(Resume.user_id == user.id).order_by(Resume.updated_at.desc())).all()
    return [resume_out(row) for row in rows]


@app.post("/api/resume", response_model=ResumeOut, status_code=status.HTTP_201_CREATED)
@app.post("/api/resumes", response_model=ResumeOut, status_code=status.HTTP_201_CREATED)
def create_resume(payload: ResumePayload, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> ResumeOut:
    resume = Resume(user_id=user.id, **payload.model_dump())
    db.add(resume)
    db.commit()
    db.refresh(resume)
    return resume_out(resume)


def owned_resume(resume_id: int, user: User, db: Session) -> Resume:
    resume = db.scalar(select(Resume).where(Resume.id == resume_id, Resume.user_id == user.id))
    if resume is None:
        raise HTTPException(status_code=404, detail="Resume not found")
    return resume


@app.get("/api/resume/{resume_id}", response_model=ResumeOut)
@app.get("/api/resumes/{resume_id}", response_model=ResumeOut)
def get_resume(resume_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> ResumeOut:
    return resume_out(owned_resume(resume_id, user, db))


@app.put("/api/resume/{resume_id}", response_model=ResumeOut)
@app.put("/api/resumes/{resume_id}", response_model=ResumeOut)
def update_resume(resume_id: int, payload: ResumePayload, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> ResumeOut:
    resume = owned_resume(resume_id, user, db)
    for key, value in payload.model_dump().items():
        setattr(resume, key, value)
    db.commit()
    db.refresh(resume)
    return resume_out(resume)


@app.delete("/api/resume/{resume_id}", status_code=status.HTTP_204_NO_CONTENT)
@app.delete("/api/resumes/{resume_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_resume(resume_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> None:
    resume = owned_resume(resume_id, user, db)
    db.delete(resume)
    db.commit()


@app.post("/api/upload/profile")
async def upload_profile(file: UploadFile = File(...), user: User = Depends(get_current_user)) -> dict[str, str]:
    allowed = {"image/jpeg", "image/png", "image/webp"}
    if file.content_type not in allowed:
        raise HTTPException(status_code=400, detail="Upload a JPG, PNG, or WebP image")
    content = await file.read()
    if len(content) > 4 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Image must be smaller than 4 MB")
    # Cloudinary is intentionally optional for local development. Configure all three
    # CLOUDINARY_* settings to switch this endpoint to managed media storage.
    if all((settings.cloudinary_cloud_name, settings.cloudinary_api_key, settings.cloudinary_api_secret)):
        import cloudinary
        import cloudinary.uploader

        cloudinary.config(
            cloud_name=settings.cloudinary_cloud_name,
            api_key=settings.cloudinary_api_key,
            api_secret=settings.cloudinary_api_secret,
            secure=True,
        )
        result = cloudinary.uploader.upload(content, folder=f"kvp-orbit/{user.id}", resource_type="image")
        return {"url": result["secure_url"]}
    extension = Path(file.filename or "image.jpg").suffix.lower() or ".jpg"
    filename = f"{user.id}-{uuid.uuid4().hex}{extension}"
    (upload_path / filename).write_bytes(content)
    return {"url": f"/uploads/{filename}"}


@app.get("/api/portfolio/me", response_model=PortfolioOut | None)
def my_portfolio(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> PortfolioOut | None:
    portfolio = db.scalar(select(Portfolio).where(Portfolio.user_id == user.id))
    return PortfolioOut.model_validate(portfolio) if portfolio else None


@app.put("/api/portfolio/me", response_model=PortfolioOut)
def save_portfolio(payload: PortfolioPayload, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> PortfolioOut:
    duplicate = db.scalar(select(Portfolio).where(Portfolio.slug == payload.slug, Portfolio.user_id != user.id))
    if duplicate:
        raise HTTPException(status_code=409, detail="That public portfolio URL is already in use")
    portfolio = db.scalar(select(Portfolio).where(Portfolio.user_id == user.id))
    if portfolio is None:
        portfolio = Portfolio(user_id=user.id, **payload.model_dump())
        db.add(portfolio)
    else:
        for key, value in payload.model_dump().items():
            setattr(portfolio, key, value)
    db.commit()
    db.refresh(portfolio)
    return PortfolioOut.model_validate(portfolio)


@app.get("/api/portfolio/{slug}", response_model=PortfolioOut)
def public_portfolio(slug: str, db: Session = Depends(get_db)) -> PortfolioOut:
    portfolio = db.scalar(select(Portfolio).where(Portfolio.slug == slug, Portfolio.is_published.is_(True)))
    if portfolio is None:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    return PortfolioOut.model_validate(portfolio)


@app.get("/api/assessments", response_model=list[AssessmentOut])
def list_assessments(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> list[AssessmentOut]:
    seed_catalog(db)
    return [AssessmentOut(id=row.id, title=row.title, description=row.description, duration_minutes=row.duration_minutes, question_count=len(row.questions)) for row in db.scalars(select(Assessment)).all()]


@app.get("/api/assessments/{assessment_id}")
def get_assessment(assessment_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict:
    assessment = db.get(Assessment, assessment_id)
    if assessment is None:
        raise HTTPException(status_code=404, detail="Assessment not found")
    questions = [{"prompt": item["prompt"], "options": item["options"]} for item in assessment.questions]
    return {"id": assessment.id, "title": assessment.title, "description": assessment.description, "duration_minutes": assessment.duration_minutes, "questions": questions}


@app.post("/api/assessments/{assessment_id}/attempts", response_model=AttemptOut, status_code=status.HTTP_201_CREATED)
def complete_assessment(assessment_id: int, payload: AttemptPayload, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> AttemptOut:
    assessment = db.get(Assessment, assessment_id)
    if assessment is None:
        raise HTTPException(status_code=404, detail="Assessment not found")
    score = sum(1 for index, question in enumerate(assessment.questions) if index < len(payload.answers) and payload.answers[index] == question["answer"])
    attempt = AssessmentAttempt(user_id=user.id, assessment_id=assessment_id, answers=payload.answers, score=score, total=len(assessment.questions))
    db.add(attempt)
    db.commit()
    db.refresh(attempt)
    return AttemptOut.model_validate(attempt)


@app.get("/api/assessments/attempts/me", response_model=list[AttemptOut])
def my_attempts(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> list[AttemptOut]:
    return [AttemptOut.model_validate(row) for row in db.scalars(select(AssessmentAttempt).where(AssessmentAttempt.user_id == user.id).order_by(AssessmentAttempt.completed_at.desc())).all()]


@app.get("/api/jobs", response_model=list[JobOut])
def list_jobs(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> list[JobOut]:
    seed_catalog(db)
    return [JobOut.model_validate(row) for row in db.scalars(select(JobOpportunity).where(JobOpportunity.is_active.is_(True))).all()]


@app.get("/api/applications", response_model=list[ApplicationOut])
def list_applications(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> list[ApplicationOut]:
    return [ApplicationOut.model_validate(row) for row in db.scalars(select(Application).where(Application.user_id == user.id).order_by(Application.updated_at.desc())).all()]


@app.post("/api/applications", response_model=ApplicationOut, status_code=status.HTTP_201_CREATED)
def create_application(payload: ApplicationPayload, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> ApplicationOut:
    if db.get(JobOpportunity, payload.job_id) is None:
        raise HTTPException(status_code=404, detail="Job not found")
    application = Application(user_id=user.id, **payload.model_dump())
    db.add(application)
    db.commit()
    db.refresh(application)
    return ApplicationOut.model_validate(application)


@app.put("/api/applications/{application_id}", response_model=ApplicationOut)
def update_application(application_id: int, payload: ApplicationPayload, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> ApplicationOut:
    application = db.scalar(select(Application).where(Application.id == application_id, Application.user_id == user.id))
    if application is None:
        raise HTTPException(status_code=404, detail="Application not found")
    for key, value in payload.model_dump().items():
        setattr(application, key, value)
    db.commit()
    db.refresh(application)
    return ApplicationOut.model_validate(application)


@app.post("/api/ats/analyze", response_model=AtsOut)
def analyze_ats(payload: AtsRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> AtsOut:
    resume = owned_resume(payload.resume_id, user, db)
    corpus = " ".join([resume.title, resume.summary, " ".join(resume.skills), " ".join(str(item) for item in resume.experience + resume.projects)]).lower()
    stop_words = {"and", "the", "with", "that", "this", "from", "for", "you", "your", "will", "are", "our", "have", "into", "using", "role", "team", "work", "years", "experience", "skills"}
    tokens = [word.strip(".,;:()[]{}!?").lower() for word in payload.job_description.split()]
    keywords = list(dict.fromkeys(word for word in tokens if len(word) > 3 and word not in stop_words))[:30]
    matched = [word for word in keywords if word in corpus]
    missing = [word for word in keywords if word not in corpus][:10]
    score = min(100, round((len(matched) / max(1, min(len(keywords), 20))) * 100))
    suggestions = []
    if not resume.summary:
        suggestions.append("Add a concise profile summary that names the role and strengths you want to be considered for.")
    if len(resume.experience) + len(resume.projects) < 2:
        suggestions.append("Add at least two experience or project entries with measurable outcomes.")
    if missing:
        suggestions.append("Where accurate, reflect the missing job-language terms in your skills and achievement descriptions.")
    if not suggestions:
        suggestions.append("Your resume has good coverage. Keep tailoring achievement language to the specific role.")
    return AtsOut(score=score, matched_keywords=matched, missing_keywords=missing, suggestions=suggestions)
