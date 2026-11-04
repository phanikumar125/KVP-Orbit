from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str

    model_config = ConfigDict(from_attributes=True)


class AuthResponse(BaseModel):
    token: str
    user: UserOut


class ResumePayload(BaseModel):
    title: str = Field(default="Untitled resume", min_length=1, max_length=160)
    template: str = Field(default="modern", pattern="^(classic|modern|professional|minimal|creative)$")
    summary: str = Field(default="", max_length=3000)
    personal_info: dict[str, Any] = Field(default_factory=dict)
    education: list[dict[str, Any]] = Field(default_factory=list)
    experience: list[dict[str, Any]] = Field(default_factory=list)
    skills: list[str] = Field(default_factory=list)
    projects: list[dict[str, Any]] = Field(default_factory=list)
    certifications: list[dict[str, Any]] = Field(default_factory=list)
    languages: list[dict[str, Any]] = Field(default_factory=list)


class ResumeOut(ResumePayload):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PortfolioPayload(BaseModel):
    slug: str = Field(min_length=3, max_length=120, pattern="^[a-z0-9-]+$")
    headline: str = Field(default="", max_length=180)
    bio: str = Field(default="", max_length=4000)
    theme: str = Field(default="orbit", max_length=40)
    links: dict[str, str] = Field(default_factory=dict)
    featured_projects: list[dict[str, Any]] = Field(default_factory=list)
    is_published: bool = False


class PortfolioOut(PortfolioPayload):
    id: int
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


class AssessmentOut(BaseModel):
    id: int
    title: str
    description: str
    duration_minutes: int
    question_count: int


class AttemptPayload(BaseModel):
    answers: list[int] = Field(default_factory=list)


class AttemptOut(BaseModel):
    id: int
    assessment_id: int
    score: int
    total: int
    completed_at: datetime
    model_config = ConfigDict(from_attributes=True)


class JobOut(BaseModel):
    id: int
    title: str
    company: str
    location: str
    employment_type: str
    description: str
    skills: list[str]
    application_url: str
    model_config = ConfigDict(from_attributes=True)


class ApplicationPayload(BaseModel):
    job_id: int
    status: str = Field(default="saved", pattern="^(saved|applied|interviewing|offer|rejected)$")
    notes: str = Field(default="", max_length=3000)


class ApplicationOut(ApplicationPayload):
    id: int
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


class AtsRequest(BaseModel):
    resume_id: int
    job_description: str = Field(min_length=30, max_length=12000)


class AtsOut(BaseModel):
    score: int
    matched_keywords: list[str]
    missing_keywords: list[str]
    suggestions: list[str]

