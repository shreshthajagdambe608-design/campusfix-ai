import sqlite3
import json
import os
import uuid
from datetime import datetime
from typing import List, Optional, Dict, Any

DB_FILE = os.environ.get("CAMPUSFIX_DB_PATH", os.path.join(os.path.dirname(__file__), "..", "campusfix.db"))

def get_db_connection():
    os.makedirs(os.path.dirname(os.path.abspath(DB_FILE)), exist_ok=True)
    conn = sqlite3.connect(DB_FILE, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS reports (
        id TEXT PRIMARY KEY,
        created_at TEXT NOT NULL,
        user_description TEXT NOT NULL,
        user_location TEXT NOT NULL,
        image_data TEXT,
        ai_analysis TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'Submitted',
        assigned_to TEXT,
        staff_notes TEXT
    )
    """)
    conn.commit()

    # Seed sample records if empty
    cursor.execute("SELECT COUNT(*) as count FROM reports")
    row = cursor.fetchone()
    if row and row["count"] == 0:
        seed_sample_data(conn)
    conn.close()

def seed_sample_data(conn):
    sample_items = [
        {
            "id": "rep-001",
            "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "user_description": "Water overflowing from 2nd floor men's restroom sink onto the tile hallway.",
            "user_location": "Science Hall, 2nd Floor Men's Restroom",
            "image_data": None,
            "ai_analysis": {
                "title": "Water Overflow from Restroom Sink",
                "category": "Plumbing",
                "priority": "High",
                "location": "Science Hall, 2nd Floor Men's Restroom",
                "description": "Report of sink water overflowing into hallway tiles creating slipping hazards.",
                "observations": ["Water actively spilling onto floor", "Located near Science Hall 2nd floor restroom"],
                "safety_note": "Slip and fall hazard; possible water intrusion into adjacent labs.",
                "recommended_action": "Shut off local supply valve and deploy wet-vac immediately.",
                "uncertainty": "Exact source of blockage unknown."
            },
            "status": "In Progress",
            "assigned_to": "Carlos M. (Plumbing Lead)",
            "staff_notes": "Main shutoff valve isolated at 10:15 AM. Drain snake in progress."
        },
        {
            "id": "rep-002",
            "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "user_description": "Exposed frayed wires dangling near ceiling light outside Room 304.",
            "user_location": "Engineering Building, 3rd Floor East Wing",
            "image_data": None,
            "ai_analysis": {
                "title": "Exposed Ceiling Wiring Near Room 304",
                "category": "Electrical",
                "priority": "Urgent",
                "location": "Engineering Building, 3rd Floor East Wing",
                "description": "Frayed live or de-energized wiring hanging from ceiling grid in high pedestrian traffic corridor.",
                "observations": ["Dangling wiring", "Proximity to classroom doorway 304"],
                "safety_note": "Potential electrocution and electrical fire danger. Cordon off corridor immediately.",
                "recommended_action": "Lock out circuit breaker 3B and dispatch certified electrician.",
                "uncertainty": "Cannot verify voltage or energization state from report."
            },
            "status": "Submitted",
            "assigned_to": None,
            "staff_notes": None
        },
        {
            "id": "rep-003",
            "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "user_description": "Study desk chair armrest snapped off in library quiet zone.",
            "user_location": "Main Library, 4th Floor Study Pod B",
            "image_data": None,
            "ai_analysis": {
                "title": "Broken Chair Armrest in Study Pod",
                "category": "Furniture",
                "priority": "Low",
                "location": "Main Library, 4th Floor Study Pod B",
                "description": "Ergonomic chair missing left armrest; jagged plastic edge exposed.",
                "observations": ["Detached armrest", "Located at Study Pod B"],
                "safety_note": "Minor scrape risk on exposed plastic edge.",
                "recommended_action": "Tag chair for surplus or swap replacement armrest during weekend rounds.",
                "uncertainty": "Chair inventory model number not provided."
            },
            "status": "Assigned",
            "assigned_to": "Facilities Custodial Team B",
            "staff_notes": "Replacement chair placed; broken chair moved to storage."
        }
    ]

    cursor = conn.cursor()
    for item in sample_items:
        cursor.execute("""
        INSERT INTO reports (id, created_at, user_description, user_location, image_data, ai_analysis, status, assigned_to, staff_notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            item["id"],
            item["created_at"],
            item["user_description"],
            item["user_location"],
            item["image_data"],
            json.dumps(item["ai_analysis"]),
            item["status"],
            item["assigned_to"],
            item["staff_notes"]
        ))
    conn.commit()

def create_report(user_description: str, user_location: str, image_data: Optional[str], ai_analysis: dict) -> dict:
    conn = get_db_connection()
    cursor = conn.cursor()
    report_id = f"rep-{uuid.uuid4().hex[:6]}"
    created_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    cursor.execute("""
    INSERT INTO reports (id, created_at, user_description, user_location, image_data, ai_analysis, status)
    VALUES (?, ?, ?, ?, ?, ?, 'Submitted')
    """, (
        report_id,
        created_at,
        user_description,
        user_location or "Unknown",
        image_data,
        json.dumps(ai_analysis)
    ))
    conn.commit()
    conn.close()
    return get_report_by_id(report_id)

def get_report_by_id(report_id: str) -> Optional[dict]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM reports WHERE id = ?", (report_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    data = dict(row)
    data["ai_analysis"] = json.loads(data["ai_analysis"])
    return data

def get_all_reports(category: Optional[str] = None, priority: Optional[str] = None, status: Optional[str] = None) -> List[dict]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM reports ORDER BY created_at DESC")
    rows = cursor.fetchall()
    conn.close()
    
    results = []
    for row in rows:
        item = dict(row)
        item["ai_analysis"] = json.loads(item["ai_analysis"])
        
        # Apply filters
        if category and item["ai_analysis"].get("category", "").lower() != category.lower():
            continue
        if priority and item["ai_analysis"].get("priority", "").lower() != priority.lower():
            continue
        if status and item.get("status", "").lower() != status.lower():
            continue
            
        results.append(item)
    return results

def update_report(report_id: str, updates: dict) -> Optional[dict]:
    conn = get_db_connection()
    cursor = conn.cursor()
    
    fields = []
    values = []
    for k, v in updates.items():
        if k in ("status", "assigned_to", "staff_notes"):
            fields.append(f"{k} = ?")
            values.append(v)
            
    if not fields:
        conn.close()
        return get_report_by_id(report_id)
        
    values.append(report_id)
    query = f"UPDATE reports SET {', '.join(fields)} WHERE id = ?"
    cursor.execute(query, tuple(values))
    conn.commit()
    conn.close()
    return get_report_by_id(report_id)

def delete_report(report_id: str) -> bool:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM reports WHERE id = ?", (report_id,))
    deleted = cursor.rowcount > 0
    conn.commit()
    conn.close()
    return deleted
