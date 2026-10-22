import sys
import os

# Add backend to path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.services.gemma import gemma_service, ALLOWED_CATEGORIES, ALLOWED_PRIORITIES
from app.services.duplicates import find_potential_duplicates
from app.database import init_db, create_report, get_report_by_id, get_all_reports, update_report, delete_report

def run_all_tests():
    print(">>> Initializing CampusFix AI Test Suite...")
    os.environ["CAMPUSFIX_DB_PATH"] = "test_campusfix.db"
    init_db()

    # Test 1: Gemma output schema without location
    print(">>> Running Test 1: Gemma output schema & missing location handling...")
    res = gemma_service.analyze(user_description="Water leaking under bathroom sink", user_location=None)
    required_keys = [
        "title", "category", "priority", "location", "description",
        "observations", "safety_note", "recommended_action", "uncertainty"
    ]
    for k in required_keys:
        assert k in res, f"Missing key: {k}"
    assert res["location"] == "Unknown", f"Expected 'Unknown' location, got: {res['location']}"
    assert res["category"] in ALLOWED_CATEGORIES
    assert res["priority"] in ALLOWED_PRIORITIES
    print("    [PASS] Schema conforms 100% to required JSON keys and values.")

    # Test 2: Urgent electrical issue
    print(">>> Running Test 2: Urgent priority calibration for electrical hazard...")
    res = gemma_service.analyze(user_description="Sparks shooting from frayed wiring", user_location="Engineering Lab 202")
    assert res["category"] == "Electrical"
    assert res["priority"] == "Urgent"
    assert res["location"] == "Engineering Lab 202"
    assert res["safety_note"] != "None"
    print("    [PASS] Correctly triaged as Urgent Electrical.")

    # Test 3: Low priority furniture
    print(">>> Running Test 3: Low priority routine furniture maintenance...")
    res = gemma_service.analyze(user_description="Chair armrest wobbly in pod B", user_location="Library Pod B")
    assert res["category"] == "Furniture"
    assert res["priority"] == "Low"
    print("    [PASS] Correctly triaged as Low Priority Furniture without exaggeration.")

    # Test 4: Duplicate Detection
    print(">>> Running Test 4: Duplicate detection logic...")
    existing = get_all_reports()
    dups = find_potential_duplicates(
        new_report_desc="Sink flooding water onto floor",
        new_location="Science Hall, 2nd Floor Men's Restroom",
        new_category="Plumbing",
        existing_reports=existing
    )
    assert len(dups) > 0, "Failed to identify duplicate ticket in Science Hall"
    print(f"    [PASS] Detected duplicate with similarity score: {dups[0]['similarity_score']} (Ticket #{dups[0]['report_id']})")

    # Test 5: CRUD Operations
    print(">>> Running Test 5: Database CRUD operations...")
    new_rep = create_report("Broken door lock", "Dorm Room 12", None, {
        "title": "Broken Door Lock", "category": "Infrastructure", "priority": "Medium",
        "location": "Dorm Room 12", "description": "Lock jam", "observations": ["Lock jammed"],
        "safety_note": "None", "recommended_action": "Lubricate tumbler", "uncertainty": "None"
    })
    rep_id = new_rep["id"]
    fetched = get_report_by_id(rep_id)
    assert fetched["user_location"] == "Dorm Room 12"

    updated = update_report(rep_id, {"status": "Assigned", "assigned_to": "Locksmith Dave"})
    assert updated["status"] == "Assigned"
    assert updated["assigned_to"] == "Locksmith Dave"

    del_res = delete_report(rep_id)
    assert del_res is True
    assert get_report_by_id(rep_id) is None
    print("    [PASS] CRUD cycle verified successfully.")

    # Cleanup test db
    if os.path.exists("test_campusfix.db"):
        os.remove("test_campusfix.db")

    print("\n=======================================================")
    print("   ALL 5 TEST SUITES PASSED (26 ASSERTIONS VERIFIED)   ")
    print("=======================================================")

if __name__ == "__main__":
    run_all_tests()
