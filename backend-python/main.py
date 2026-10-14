from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
import uuid

app = FastAPI(
    title="RescuePaws Community Animal Rescue API",
    description="FastAPI Backend for RescuePaws - reports, dispatch, triage, appointments & volunteers",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class CommentUpdate(BaseModel):
    id: str = Field(default_factory=lambda: f"up-{uuid.uuid4().hex[:6]}")
    author: str
    role: str = "citizen"
    text: str
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

class AIAnalysis(BaseModel):
    detected_species: Optional[str] = "Canine / Feline"
    confidence: Optional[float] = 0.92
    recommended_urgency: Optional[str] = "medium"
    detected_injuries: Optional[List[str]] = []
    first_aid_advice: Optional[str] = "Keep animal safe and hydrated."

class ReportCreate(BaseModel):
    animal_type: str = "other"
    description: str
    photo_url: Optional[str] = "https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=800&q=80"
    lat: float
    lng: float
    urgency_level: Optional[str] = "medium"
    address: Optional[str] = None
    reporter_name: Optional[str] = "Anonymous Citizen"
    reporter_phone: Optional[str] = None

class Report(BaseModel):
    id: str
    animal_type: str
    description: str
    photo_url: str
    lat: float
    lng: float
    urgency_level: str
    status: str
    created_at: str
    address: Optional[str] = None
    reporter_name: Optional[str] = None
    reporter_phone: Optional[str] = None
    assigned_volunteer_id: Optional[str] = None
    assigned_volunteer_name: Optional[str] = None
    ai_analysis: Optional[AIAnalysis] = None
    updates: Optional[List[CommentUpdate]] = []

class AppointmentCreate(BaseModel):
    type: str = "vet_intake"
    animal_report_id: Optional[str] = None
    contact_name: str
    contact_email: str
    contact_phone: Optional[str] = ""
    scheduled_date: Optional[str] = None
    notes: Optional[str] = ""

class Appointment(BaseModel):
    id: str
    type: str
    animal_report_id: Optional[str] = None
    contact_name: str
    contact_email: str
    contact_phone: str
    scheduled_date: str
    notes: str
    status: str
    created_at: str

# In-Memory DB Seeds
reports_db: List[dict] = [
    {
        "id": "rep-101",
        "animal_type": "dog",
        "description": "Medium golden mix limping heavily near Maple Park playground. Very gentle but unable to put weight on hind leg.",
        "photo_url": "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80",
        "lat": 37.7749,
        "lng": -122.4194,
        "urgency_level": "high",
        "status": "In Progress",
        "created_at": datetime.utcnow().isoformat(),
        "address": "840 Maple St, near playground benches",
        "reporter_name": "Elena Rostova",
        "reporter_phone": "(555) 234-9811",
        "assigned_volunteer_id": "vol-1",
        "assigned_volunteer_name": "Marcus Chen",
        "ai_analysis": {
            "detected_species": "Golden Retriever Mix",
            "confidence": 0.94,
            "recommended_urgency": "high",
            "detected_injuries": ["Hind leg trauma / limping", "Dehydration signs"]
        },
        "updates": [
            {
                "id": "up-101",
                "author": "Marcus Chen",
                "role": "volunteer",
                "text": "Rescue accepted. In transit with first aid kit and crate.",
                "created_at": datetime.utcnow().isoformat()
            }
        ]
    }
]

volunteers_db = [
    {"id": "vol-1", "name": "Marcus Chen", "email": "marcus.chen@example.com", "role": "volunteer", "phone": "(555) 782-9901", "is_available": True, "rescues_completed": 47},
    {"id": "vol-2", "name": "Elena Rostova", "email": "elena.r@example.com", "role": "volunteer", "phone": "(555) 349-1120", "is_available": True, "rescues_completed": 31},
    {"id": "vol-3", "name": "Dr. Sarah Lin", "email": "sarah.lin@example.com", "role": "volunteer", "phone": "(555) 890-4432", "is_available": False, "rescues_completed": 89},
]

appointments_db: List[dict] = []

# Endpoints
@app.get("/api/health")
def health_check():
    return {"status": "ok", "app": "RescuePaws FastAPI Backend", "timestamp": datetime.utcnow().isoformat()}

@app.get("/api/stats")
def get_stats():
    rescued = len([r for r in reports_db if r.get("status") in ["Rescued", "Closed"]])
    return {
        "rescued_this_month": 140 + rescued,
        "active_volunteers": len([v for v in volunteers_db if v["is_available"]]),
        "total_reports": len(reports_db),
        "avg_response_time_min": 19
    }

@app.get("/api/reports")
def get_reports(status: Optional[str] = Query(None), urgency: Optional[str] = Query(None)):
    data = list(reports_db)
    if status and status.lower() != "all":
        data = [r for r in data if r["status"].lower() == status.lower()]
    if urgency and urgency.lower() != "all":
        data = [r for r in data if r["urgency_level"].lower() == urgency.lower()]
    return data

@app.get("/api/reports/{report_id}")
def get_report(report_id: str):
    for r in reports_db:
        if r["id"] == report_id:
            return r
    raise HTTPException(status_code=404, detail="Report not found")

@app.post("/api/reports", status_code=201)
def create_report(payload: ReportCreate):
    new_id = f"rep-{uuid.uuid4().hex[:5]}"
    new_rep = {
        "id": new_id,
        "animal_type": payload.animal_type,
        "description": payload.description,
        "photo_url": payload.photo_url,
        "lat": payload.lat,
        "lng": payload.lng,
        "urgency_level": payload.urgency_level or "medium",
        "status": "Reported",
        "created_at": datetime.utcnow().isoformat(),
        "address": payload.address or f"{payload.lat:.4f}, {payload.lng:.4f}",
        "reporter_name": payload.reporter_name,
        "reporter_phone": payload.reporter_phone,
        "ai_analysis": {
            "detected_species": payload.animal_type.capitalize(),
            "confidence": 0.92,
            "recommended_urgency": payload.urgency_level or "medium",
            "detected_injuries": ["Stable / Pending Field Assessment"]
        },
        "updates": [
            {
                "id": f"up-{uuid.uuid4().hex[:6]}",
                "author": payload.reporter_name or "Anonymous Citizen",
                "role": "citizen",
                "text": "Report logged into dispatch queue.",
                "created_at": datetime.utcnow().isoformat()
            }
        ]
    }
    reports_db.insert(0, new_rep)
    return new_rep

@app.patch("/api/reports/{report_id}")
def update_report(report_id: str, updates: dict):
    for r in reports_db:
        if r["id"] == report_id:
            r.update(updates)
            return r
    raise HTTPException(status_code=404, detail="Report not found")

@app.get("/api/volunteers")
def get_volunteers():
    return volunteers_db

@app.get("/api/volunteers/nearby-unassigned")
def get_unassigned():
    return [r for r in reports_db if r["status"] == "Reported"]

@app.post("/api/appointments", status_code=201)
def create_appointment(payload: AppointmentCreate):
    apt = {
        "id": f"apt-{uuid.uuid4().hex[:6]}",
        "type": payload.type,
        "animal_report_id": payload.animal_report_id,
        "contact_name": payload.contact_name,
        "contact_email": payload.contact_email,
        "contact_phone": payload.contact_phone,
        "scheduled_date": payload.scheduled_date or datetime.utcnow().isoformat(),
        "notes": payload.notes,
        "status": "pending",
        "created_at": datetime.utcnow().isoformat(),
    }
    appointments_db.append(apt)
    return {"success": True, "appointment": apt}

@app.get("/api/appointments")
def get_appointments():
    return appointments_db
