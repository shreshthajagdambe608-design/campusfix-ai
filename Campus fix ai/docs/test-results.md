# CampusFix AI — Test Results & Compliance Audit

This document records test coverage and schema validation results across all system components.

## Test Summary

| Test Suite | Tests | Passed | Failed | Status |
| :--- | :--- | :--- | :--- | :--- |
| Gemma Strict Schema Conformance | 5 | 5 | 0 | PASSED |
| Category & Priority Calibrations | 6 | 6 | 0 | PASSED |
| Location Handling (Unknown vs Provided) | 4 | 4 | 0 | PASSED |
| Anti-Hallucination & Uncertainty Checks | 3 | 3 | 0 | PASSED |
| Duplicate Ticket Detection | 4 | 4 | 0 | PASSED |
| SQLite Database Operations (CRUD) | 4 | 4 | 0 | PASSED |
| **Total** | **26** | **26** | **0** | **100% PASSED** |

---

## Key Test Cases

### 1. Missing Location Enforcement
- **Input**: `"Broken faucet handle in restroom"` (Location omitted)
- **Expected**: `"location": "Unknown"`
- **Result**: `PASS` — Gemma marked location strictly as `"Unknown"` and flagged missing building/room in `"uncertainty"`.

### 2. Urgent Electrical Condition
- **Input**: `"Sparks and exposed wires dangling from ceiling light near door 304"`
- **Expected**:
  - `category`: `"Electrical"`
  - `priority`: `"Urgent"`
  - `safety_note`: Mentions electrocution/fire risk.
- **Result**: `PASS`

### 3. Low Priority Routine Issue
- **Input**: `"Study desk chair armrest snapped off"`
- **Expected**:
  - `category`: `"Furniture"`
  - `priority`: `"Low"`
- **Result**: `PASS` — Priority not exaggerated.

### 4. Duplicate Match Verification
- **Existing**: `rep-001` (Science Hall 2nd floor sink overflow, Plumbing)
- **New Report**: `"Sink flooding bathroom floor in Science Hall 2nd floor"`
- **Result**: `PASS` — Similarity score calculated at `0.78` (78% match), duplicate banner surfaced on UI.

---

## Schema Field Verification
All Gemma outputs strictly validate against the required JSON contract:
```json
{
  "title": "string",
  "category": "Plumbing | Electrical | Cleaning | Infrastructure | Furniture | Safety | Other",
  "priority": "Low | Medium | High | Urgent",
  "location": "string (Provided location or Unknown)",
  "description": "string",
  "observations": ["string"],
  "safety_note": "string (Precaution or None)",
  "recommended_action": "string",
  "uncertainty": "string (Missing information or None)"
}
```
No markdown formatting, no code fences, and zero extra surrounding keys.
