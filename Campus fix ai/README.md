# CampusFix AI 🏫🛠️
> **Intelligent campus maintenance reporting powered by Google Gemma open weights.**  
> *Transforming student reports into clear, structured, and actionable facilities tickets.*

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python 3.10+](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![Model: Gemma](https://img.shields.io/badge/Model-Gemma--4--E4B--IT-red.svg)](https://ai.google.dev/gemma)
[![Graphify: Enabled](https://img.shields.io/badge/Graphify-Knowledge--Graph-8b5cf6.svg)](https://github.com/shreshthajagdambe608-design/campusfix-ai)
[![Theme: Dark & Light](https://img.shields.io/badge/Theme-Dark%20%7C%20Light-10b981.svg)](https://github.com/shreshthajagdambe608-design/campusfix-ai)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110%2B-009688.svg)](https://fastapi.tiangolo.com/)
[![React 18](https://img.shields.io/badge/React-18.2-61dafb.svg)](https://react.dev/)

---

## 🌟 Overview
Campus maintenance departments are constantly inundated with vague, poorly formatted student complaints: *"The bathroom is broken"*, *"Wires look scary"*, or *"Trash everywhere"*. These reports lack critical dispatch information such as precise location, priority triage, safety warnings, and actionable next steps.

**CampusFix AI** solves this by converting multi-modal student input (photos, written descriptions, or both) into rigorous, structured maintenance reports that campus staff can immediately dispatch.

### 🎯 Core Principles & Features
1. **Zero Hallucination**: Never invents campus locations, building names, room numbers, repair costs, or internal engineering diagnoses.
2. **Missing Information Discipline**: If the student does not provide a location, the AI strictly sets `"location": "Unknown"` and notes the missing info in `"uncertainty"`.
3. **Calibrated Priority Triage**:
   - `Low`: Minor cosmetic or non-blocking maintenance issue.
   - `Medium`: Routine campus maintenance task.
   - `High`: Significant operational disruption or credible safety concern.
   - `Urgent`: Credible immediate danger requiring prompt emergency attention.
4. **Strict JSON Schema Conformance**: Direct, valid JSON with no markdown fences, no surrounding text, and exact required keys.
5. **🕸️ Graphify Knowledge Graph**: Builds an interactive topological force-directed relationship graph of all campus incidents, building communities, maintenance categories, and duplicate links. Exports standard `graphify-out/graph.json` and `graphify-out/GRAPH_REPORT.md`.
6. **🌙 Adaptive Dark Theme**: Full high-contrast dark mode toggle with glowing neon indicators, smooth transitions, and themed graph physics.
7. **Human-in-the-Loop Safeguard**: Recommendations for human staff review, not unverified diagnoses or completed repairs.
8. **Duplicate Defense**: Cross-references existing active tickets in the same building/room to prevent sending 4 plumbers to the same leak.

---

## 🏗️ Repository Structure

```
campusfix-ai/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ReportCard.jsx        # Ticket card for dashboard grid
│   │   │   ├── ImageUploader.jsx     # Photo upload with drag & drop preview
│   │   │   ├── AIAnalysisPanel.jsx   # Structured Gemma output & alerts
│   │   │   └── StatusBadge.jsx       # Category, Priority & Status badges
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx         # Overview, counters, search & filters
│   │   │   ├── GraphifyView.jsx      # 🕸️ Interactive Graphify network visualizer
│   │   │   ├── NewReport.jsx         # Live student submission & AI triage
│   │   │   ├── ReviewReport.jsx      # Facilities coordinator queue
│   │   │   └── ReportDetails.jsx     # Full ticket view & technician dispatch
│   │   ├── services/api.js           # REST API client
│   │   ├── App.jsx                   # Root container, Dark Mode & navigation
│   │   ├── main.jsx                  # React DOM mount point
│   │   └── index.css                 # Base Tailwind styling
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── backend/
│   ├── app/
│   │   ├── main.py                   # FastAPI / Starlette server & CORS setup
│   │   ├── routes/reports.py         # REST endpoints for tickets & AI analysis
│   │   ├── services/gemma.py         # Gemma 4 inference service (multi-provider)
│   │   ├── services/graphify.py      # 🕸️ Graphify engine & topology builder
│   │   ├── services/duplicates.py    # Jaccard + token duplicate detection
│   │   ├── schemas.py                # Pydantic models & validation contracts
│   │   └── database.py               # SQLite storage & auto-seed samples
│   ├── tests/
│   │   └── test_reports.py           # Unit & schema compliance test suite
│   └── requirements.txt
├── docs/
│   ├── architecture.md               # Detailed system design & pipeline
│   ├── demo-script.md                # 3-minute hackathon pitch & demo steps
│   └── test-results.md               # Test coverage & verification audit
├── sample-data/
│   └── sample_reports.json           # Realistic campus maintenance test cases
├── all_in_one_campusfix.py           # 🚀 Instant 1-file runnable distribution
├── .env.example
├── .gitignore
├── LICENSE
└── README.md
```

---

## ⚡ Instant 1-File Run (Zero Setup Required)

Want to run the entire app immediately without installing node or configuring microservices? Use the bundled standalone single file:

```bash
python all_in_one_campusfix.py
```

Then open your browser to:
👉 **`http://localhost:8000`**

It includes the complete embedded UI, full Gemma AI reasoning engine, SQLite storage, and sample records in a single self-contained script!

---

## 🚀 Standard Repository Run (Dual Service)

### 1. Backend Setup
```bash
cd backend
python -m pip install -r requirements.txt
python -m app.main
```
The API server will run at `http://localhost:8000` (Interactive Swagger docs at `http://localhost:8000/docs`).

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The client will launch at `http://localhost:5173`.

---

## 🤖 Gemma AI Model Configuration

In compliance with hackathon regulations, CampusFix AI is built exclusively for the **Google Gemma** open-weight family. The service auto-detects and connects to any of the following backends (configured via `.env`):

| Provider | Model Identifier | Setup | Latency |
| :--- | :--- | :--- | :--- |
| **Groq (Free)** | `gemma2-9b-it` | Set `GROQ_API_KEY` in `.env` | ~350 ms |
| **Google AI Studio** | `gemma-2-9b-it` | Set `GEMINI_API_KEY` in `.env` | ~600 ms |
| **Ollama (Local)** | `gemma2` | Run `ollama run gemma2` locally | Offline |
| **Gemma Rule Engine** | Built-in | Automatic fallback | < 5 ms |

### Required JSON Schema Contract
```json
{
  "title": "Water Overflow from Restroom Sink",
  "category": "Plumbing",
  "priority": "High",
  "location": "Science Hall, 2nd Floor Men's Restroom",
  "description": "Report of sink water overflowing onto floor tiles creating slipping hazards.",
  "observations": [
    "Water actively spilling onto floor",
    "Located near Science Hall 2nd floor restroom"
  ],
  "safety_note": "Slip and fall hazard; possible water intrusion into adjacent labs.",
  "recommended_action": "Shut off local supply valve and deploy wet-vac immediately.",
  "uncertainty": "Exact source of blockage unknown."
}
```

---

## 🧪 Running Automated Tests

Run the test suite to verify schema compliance and duplicate detection:

```bash
python -m pytest backend/tests/test_reports.py -v
```

All 26 test assertions validate:
- ✅ Strict JSON formatting & allowed categories
- ✅ Non-exaggerated priority assignment
- ✅ `"Unknown"` location fallback when omitted
- ✅ Duplicate ticket identification
- ✅ Database CRUD integrity

---

## 👥 Contributors & License
- Built for the Google Gemma AI Hackathon.
- Open-sourced under the [MIT License](LICENSE).
