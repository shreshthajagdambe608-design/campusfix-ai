import os
import json
import pytest

from app.services.gemma import gemma_service, ALLOWED_CATEGORIES, ALLOWED_PRIORITIES
from app.services.duplicates import find_potential_duplicates
from app.database import init_db, create_report, get_report_by_id, get_all_reports, update_report, delete_report

@pytest.fixture(autouse=True)
def setup_test_db(tmp_path, monkeypatch):
    test_db = str(tmp_path / "test_campusfix.db")
    monkeypatch.setenv("CAMPUSFIX_DB_PATH", test_db)
    init_db()

def test_gemma_schema_compliance_without_location():
    """Verify schema format when no location is provided."""
    desc = "There is water leaking under the bathroom sink."
    res = gemma_service.analyze(user_description=desc, user_location=None)

    required_keys = [
        "title", "category", "priority", "location", "description",
        "observations", "safety_note", "recommended_action", "uncertainty"
    ]
    for key in required_keys:
        assert key in res, f"Missing required key: {key}"

    assert res["category"] in ALLOWED_CATEGORIES
    assert res["priority"] in ALLOWED_PRIORITIES
    assert res["location"] == "Unknown", "Location must be 'Unknown' if not provided by user"
    assert isinstance(res["observations"], list)
    assert len(res["observations"]) > 0

def test_gemma_electrical_urgent_priority():
    """Verify high urgency assignment for dangerous electrical conditions."""
    desc = "Sparks flying and exposed frayed wires dangling near entrance door."
    loc = "Library West Entry"
    res = gemma_service.analyze(user_description=desc, user_location=loc)

    assert res["category"] == "Electrical"
    assert res["priority"] == "Urgent"
    assert res["location"] == "Library West Entry"
    assert res["safety_note"] != "None"

def test_gemma_furniture_low_priority():
    """Verify routine/minor issues are assigned Low priority."""
    desc = "A small wheel on the computer lab chair is wobbling."
    loc = "Tech Center Room 102"
    res = gemma_service.analyze(user_description=desc, user_location=loc)

    assert res["category"] == "Furniture"
    assert res["priority"] == "Low"
    assert res["location"] == "Tech Center Room 102"

def test_duplicate_detection():
    """Verify duplicate detection finds existing reports in same location/topic."""
    existing = [
        {
            "id": "rep-101",
            "user_location": "Science Hall, 2nd Floor Men's Restroom",
            "user_description": "Water overflowing from sink onto floor",
            "ai_analysis": {
                "title": "Sink water overflow",
                "category": "Plumbing"
            },
            "status": "In Progress"
        },
        {
            "id": "rep-102",
            "user_location": "Dorm Quad B",
            "user_description": "Trash can knocked over on grass",
            "ai_analysis": {
                "title": "Trash spill",
                "category": "Cleaning"
            },
            "status": "Submitted"
        }
    ]

    new_desc = "Sink flooding bathroom floor in Science Hall 2nd floor"
    new_loc = "Science Hall, 2nd Floor Men's Restroom"
    new_cat = "Plumbing"

    dups = find_potential_duplicates(new_desc, new_loc, new_cat, existing)
    assert len(dups) >= 1
    assert dups[0]["report_id"] == "rep-101"
    assert dups[0]["similarity_score"] > 0.3

def test_crud_operations():
    """Verify end-to-end SQLite CRUD."""
    ai_data = {
        "title": "Broken window latch",
        "category": "Infrastructure",
        "priority": "Medium",
        "location": "Room 105",
        "description": "Window cannot close properly.",
        "observations": ["Latch loose"],
        "safety_note": "None",
        "recommended_action": "Tighten mounting screws.",
        "uncertainty": "None"
    }

    # Create
    report = create_report("Window won't lock", "Room 105", None, ai_data)
    report_id = report["id"]
    assert report["user_location"] == "Room 105"

    # Read
    fetched = get_report_by_id(report_id)
    assert fetched is not None
    assert fetched["ai_analysis"]["category"] == "Infrastructure"

    # Update
    updated = update_report(report_id, {"status": "Assigned", "assigned_to": "Jane Doe"})
    assert updated["status"] == "Assigned"
    assert updated["assigned_to"] == "Jane Doe"

    # Delete
    deleted = delete_report(report_id)
    assert deleted is True
    assert get_report_by_id(report_id) is None
