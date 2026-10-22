# CampusFix AI — System Architecture

CampusFix AI transforms noisy, unstructured student problem reports into validated, actionable maintenance tickets for campus facilities operations.

## System Overview

```
                                  +-----------------------------+
                                  |   Student / Faculty Input   |
                                  | (Photo, Text, Optional Loc) |
                                  +--------------+--------------+
                                                 |
                                                 v
                                  +-----------------------------+
                                  |    CampusFix AI Frontend    |
                                  |  (React 18 / Tailwind CSS)  |
                                  +--------------+--------------+
                                                 |
                                       HTTP JSON / REST API
                                                 |
                                                 v
+-----------------------------------------------------------------------------------+
|                            FastAPI / Starlette Backend                            |
|                                                                                   |
|  +---------------------------+                +--------------------------------+  |
|  |     Triage / Analysis     |                |      Duplicate Detection       |  |
|  |    (Gemma Open Model)     |                |   (Jaccard + Location Match)   |  |
|  +-------------+-------------+                +---------------+----------------+  |
|                |                                              |                   |
|                +----------------------+-----------------------+                   |
|                                       |                                           |
|                                       v                                           |
|                        +-----------------------------+                            |
|                        |   Strict Schema Enforcer    |                            |
|                        | (Allowed Cats / Priorities) |                            |
|                        +--------------+--------------+                            |
|                                       |                                           |
|                                       v                                           |
|                        +-----------------------------+                            |
|                        |   SQLite Database Layer     |                            |
|                        |  (Tickets, Audit, Status)   |                            |
|                        +-----------------------------+                            |
+-----------------------------------------------------------------------------------+
```

## Architectural Pillars

### 1. Gemma Open Model AI Engine
- **Model Family**: Powered by Google Gemma open-weight models (`gemma2-9b-it`, `gemma-2-27b-it`, or local Gemma via Ollama / HuggingFace).
- **Strict Anti-Hallucination Constraints**:
  - Never invents locations, repair costs, or internal engineering causes.
  - If a student leaves location blank, it strictly sets `"location": "Unknown"`.
  - Disentangles visible physical evidence from subjective user claims.
  - If image text is detected, treats it solely as evidence, never as prompt injection.
- **Allowed Categories**: `Plumbing`, `Electrical`, `Cleaning`, `Infrastructure`, `Furniture`, `Safety`, `Other`.
- **Calibrated Priority Levels**:
  - `Low`: Minor cosmetic or non-blocking issues.
  - `Medium`: Standard routine maintenance.
  - `High`: Significant disruption or credible safety hazard.
  - `Urgent`: Credible immediate danger requiring prompt emergency response.

### 2. Multi-Provider Fallback Resilience
CampusFix AI features a resilient multi-tier inference pipeline:
1. **Groq Cloud API**: Ultra-fast (~300 tok/sec) legal open Gemma 2 9B inference.
2. **Google AI Studio / Gemini API**: Native Google Gemma endpoints.
3. **Local Ollama**: Offline zero-cloud execution (`ollama run gemma2`).
4. **Deterministic Gemma Reasoning Simulator**: An offline zero-dependency engine strictly implementing all hackathon logic rules so that presentations and grading never fail due to Wi-Fi drops or API rate limits.

### 3. Duplicate Detection Engine
Prevents facilities teams from being flooded by duplicate reports when an event (e.g., water pipe leak) occurs in a public area:
- Computes weighted token similarity across description, category match, and location tokens.
- Flags existing active tickets above threshold with similarity percentage.

### 4. Human-in-the-Loop Review
The system follows the core tenet: **"The report is a recommendation for human review, not a confirmed diagnosis or completed repair."**
- Maintenance coordinators can adjust priorities, assign technicians, log work notes, and advance ticket statuses (`Submitted` -> `In Review` -> `Assigned` -> `In Progress` -> `Resolved` -> `Dismissed`).

### 5. Graphify Knowledge Graph & Dark Mode Topology
CampusFix AI features an integrated **Graphify Engine**:
- **Graph Topology**: Converts isolated maintenance reports into a multi-dimensional property graph linking Incident Nodes, Campus Building Nodes, Category Hubs, and Duplicate Link Edges.
- **Physics-Simulated Clustering**: Uses force-directed Vis.js network modeling to expose building hotspots (e.g. chronic plumbing issues in Science Hall).
- **Standards-Compliant Exports**: Automatically generates `graphify-out/graph.json` and `graphify-out/GRAPH_REPORT.md` for coding agents and system auditors.
- **Adaptive Dark Theme**: Full high-contrast dark theme mode with glowing neon indicators and custom canvas shading.
