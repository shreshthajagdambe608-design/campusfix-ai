from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List, Dict, Any

from app.schemas import (
    AnalyzeRequest,
    GemmaAnalysisOutput,
    ReportCreate,
    ReportUpdate,
    ReportResponse
)
from app.database import (
    create_report,
    get_report_by_id,
    get_all_reports,
    update_report,
    delete_report
)
from app.services.gemma import gemma_service
from app.services.duplicates import find_potential_duplicates

router = APIRouter(prefix="/api/reports", tags=["Reports"])

@router.post("/analyze")
def analyze_issue(payload: AnalyzeRequest):
    """
    Run Gemma AI inference on student submission and check for duplicates.
    """
    ai_result = gemma_service.analyze(
        user_description=payload.description or "",
        user_location=payload.location,
        image_base64=payload.image_base64
    )
    
    # Check potential duplicates against active records
    existing = get_all_reports()
    duplicates = find_potential_duplicates(
        new_report_desc=payload.description or "",
        new_location=payload.location or ai_result.get("location", "Unknown"),
        new_category=ai_result.get("category", "Other"),
        existing_reports=existing
    )
    
    return {
        "ai_analysis": ai_result,
        "potential_duplicates": duplicates
    }

@router.post("")
def submit_report(payload: Dict[str, Any]):
    """
    Finalize and submit a verified report to the campus facilities database.
    """
    user_desc = payload.get("user_description") or payload.get("description", "")
    user_loc = payload.get("user_location") or payload.get("location", "Unknown")
    image_data = payload.get("image_data") or payload.get("image_base64")
    ai_analysis = payload.get("ai_analysis", {})

    if not ai_analysis:
        # Generate on the fly if not provided
        ai_analysis = gemma_service.analyze(user_desc, user_loc, image_data)

    created = create_report(
        user_description=user_desc,
        user_location=user_loc,
        image_data=image_data,
        ai_analysis=ai_analysis
    )
    return created

@router.get("")
def list_reports(
    category: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    status: Optional[str] = Query(None)
):
    """
    Retrieve all campus reports with optional filtering.
    """
    return get_all_reports(category=category, priority=priority, status=status)

@router.get("/{report_id}")
def get_report(report_id: str):
    """
    Get full report details along with duplicate cross-references.
    """
    report = get_report_by_id(report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
        
    # Check duplicates for context
    existing = [r for r in get_all_reports() if r["id"] != report_id]
    duplicates = find_potential_duplicates(
        new_report_desc=report["user_description"],
        new_location=report["user_location"],
        new_category=report["ai_analysis"].get("category", "Other"),
        existing_reports=existing
    )
    report["potential_duplicates"] = duplicates
    return report

@router.patch("/{report_id}")
def modify_report(report_id: str, updates: Dict[str, Any]):
    """
    Update ticket status, assign maintenance staff, or append notes.
    """
    updated = update_report(report_id, updates)
    if not updated:
        raise HTTPException(status_code=404, detail="Report not found")
    return updated

@router.delete("/{report_id}")
def remove_report(report_id: str):
    """
    Delete a report by ID.
    """
    success = delete_report(report_id)
    if not success:
        raise HTTPException(status_code=404, detail="Report not found")
    return {"message": "Report deleted successfully", "id": report_id}
