import re
from typing import List, Dict, Any

def tokenize(text: str) -> set:
    if not text:
        return set()
    words = re.findall(r"\w+", text.lower())
    # Filter common stopwords
    stopwords = {"the", "a", "an", "is", "in", "at", "of", "on", "and", "to", "for", "with", "from"}
    return {w for w in words if w not in stopwords and len(w) > 2}

def jaccard_similarity(set1: set, set2: set) -> float:
    if not set1 or not set2:
        return 0.0
    intersection = len(set1.intersection(set2))
    union = len(set1.union(set2))
    return intersection / union if union > 0 else 0.0

def find_potential_duplicates(new_report_desc: str, new_location: str, new_category: str, existing_reports: List[Dict[str, Any]], threshold: float = 0.25) -> List[Dict[str, Any]]:
    """
    Find duplicate issues based on:
    1. Category match
    2. Location token overlap
    3. Issue description token overlap
    """
    duplicates = []
    new_desc_tokens = tokenize(new_report_desc)
    new_loc_tokens = tokenize(new_location) if new_location and new_location != "Unknown" else set()

    for report in existing_reports:
        # Don't check against resolved tickets
        if report.get("status") in ("Resolved", "Dismissed"):
            continue

        ai_data = report.get("ai_analysis", {})
        existing_cat = ai_data.get("category", "")
        existing_loc = report.get("user_location", "")
        existing_desc = report.get("user_description", "")
        existing_title = ai_data.get("title", "")

        existing_desc_tokens = tokenize(existing_desc).union(tokenize(existing_title))
        existing_loc_tokens = tokenize(existing_loc)

        desc_sim = jaccard_similarity(new_desc_tokens, existing_desc_tokens)
        loc_sim = jaccard_similarity(new_loc_tokens, existing_loc_tokens) if (new_loc_tokens and existing_loc_tokens) else 0.0

        # Category match boost
        cat_match = 1.0 if (new_category and existing_cat and new_category.lower() == existing_cat.lower()) else 0.0

        # Weighted aggregate score
        if new_loc_tokens and existing_loc_tokens:
            score = (desc_sim * 0.45) + (loc_sim * 0.40) + (cat_match * 0.15)
        else:
            score = (desc_sim * 0.70) + (cat_match * 0.30)

        if score >= threshold:
            duplicates.append({
                "report_id": report["id"],
                "title": existing_title or "Campus Issue",
                "location": existing_loc or "Unknown",
                "category": existing_cat or "Other",
                "similarity_score": round(score, 2),
                "status": report.get("status", "Submitted")
            })

    # Sort descending by similarity score
    duplicates.sort(key=lambda x: x["similarity_score"], reverse=True)
    return duplicates
