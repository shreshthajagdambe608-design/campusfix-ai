from enum import Enum
from typing import List, Optional, Any, Dict
from datetime import datetime

try:
    from pydantic import BaseModel, Field
except ImportError:
    # Graceful fallback if pydantic is not installed
    class BaseModel:
        def __init__(self, **kwargs):
            for k, v in kwargs.items():
                setattr(self, k, v)
        def model_dump(self):
            return self.__dict__
        def dict(self):
            return self.__dict__
    def Field(default=None, **kwargs):
        return default

class CategoryEnum(str, Enum):
    PLUMBING = "Plumbing"
    ELECTRICAL = "Electrical"
    CLEANING = "Cleaning"
    INFRASTRUCTURE = "Infrastructure"
    FURNITURE = "Furniture"
    SAFETY = "Safety"
    OTHER = "Other"

class PriorityEnum(str, Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    URGENT = "Urgent"

class StatusEnum(str, Enum):
    NEW = "Submitted"
    IN_REVIEW = "In Review"
    ASSIGNED = "Assigned"
    IN_PROGRESS = "In Progress"
    RESOLVED = "Resolved"
    DISMISSED = "Dismissed"

class GemmaAnalysisOutput(BaseModel):
    title: str = Field(..., description="Short issue title")
    category: str = Field(..., description="One allowed category: Plumbing, Electrical, Cleaning, Infrastructure, Furniture, Safety, Other")
    priority: str = Field(..., description="Low, Medium, High, or Urgent")
    location: str = Field("Unknown", description="Provided location or Unknown")
    description: str = Field(..., description="Concise issue summary")
    observations: List[str] = Field(default_factory=list, description="Visible or explicitly reported facts")
    safety_note: str = Field("None", description="Precaution or None")
    recommended_action: str = Field(..., description="Practical next step")
    uncertainty: str = Field("None", description="Missing information or None")

class AnalyzeRequest(BaseModel):
    description: Optional[str] = ""
    location: Optional[str] = None
    image_base64: Optional[str] = None
    image_url: Optional[str] = None

class DuplicateMatch(BaseModel):
    report_id: str
    title: str
    location: str
    category: str
    similarity_score: float
    status: str

class ReportCreate(BaseModel):
    user_description: str
    user_location: Optional[str] = None
    image_data: Optional[str] = None
    ai_analysis: GemmaAnalysisOutput

class ReportUpdate(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None
    assigned_to: Optional[str] = None
    staff_notes: Optional[str] = None

class ReportResponse(BaseModel):
    id: str
    created_at: str
    user_description: str
    user_location: str
    image_data: Optional[str] = None
    ai_analysis: GemmaAnalysisOutput
    status: str
    assigned_to: Optional[str] = None
    staff_notes: Optional[str] = None
    potential_duplicates: List[DuplicateMatch] = Field(default_factory=list)
