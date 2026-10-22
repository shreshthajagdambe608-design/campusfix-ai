# CampusFix AI — Hackathon Live Demo Script (3-Minute Pitch)

This script is structured for hackathon judges and live presentations.

---

## ⏱️ Act 1: The Problem (0:00 - 0:40)
- **Speaker:** "Every day on university campuses, students encounter broken facilities—burst pipes, exposed electrical wiring, shattered glass, or broken study furniture. But traditional reporting forms are slow, ambiguous, and flood maintenance dispatchers with vague complaints like *'The bathroom is broken'*, lacking location, category, or urgency."
- **Action:** Open `http://localhost:8000` (or `http://localhost:5173`) showing the **CampusFix AI Dashboard**.

---

## ⏱️ Act 2: Gemma AI in Action (0:40 - 1:40)
- **Speaker:** "Here is CampusFix AI, built exclusively with Google Gemma open models. Watch what happens when a student files an urgent safety issue."
- **Action:**
  1. Click **"+ New Issue Report"**.
  2. Enter Description:
     > *"There are exposed wires dangling from the ceiling light in the hallway and sparks are flickering near the doorway."*
  3. Enter Location:
     > *"Engineering Building, 3rd Floor East Wing"*
  4. Click **"✨ Analyze with Gemma AI"**.
- **Speaker Highlights:**
  - "Notice what Gemma did in 0.4 seconds:
    - Automatically assigned **Electrical** category.
    - Assigned **Urgent** priority because sparks pose immediate danger.
    - Strictly extracted the provided location without guessing.
    - Issued a specific safety note: *'Credible electrocution or electrical fire hazard. Cordon off area immediately.'*
    - Generated a practical next step: *'Lock out upstream breaker and dispatch licensed electrician.'*
    - Reminded staff that this is a recommendation for human review."

---

## ⏱️ Act 3: Anti-Hallucination & Uncertainty Handling (1:40 - 2:15)
- **Speaker:** "Now let's test strict truthfulness. What if the student forgets the location and only says: *'Water is leaking fast'*?"
- **Action:**
  1. Clear location field.
  2. Enter Description: *"Water is dripping through the ceiling tiles onto the carpet."*
  3. Click **"✨ Analyze with Gemma AI"**.
- **Speaker Highlights:**
  - "Look at the `location` field: **'Unknown'**.
  - CampusFix AI and Gemma NEVER invent buildings, room numbers, or repair costs.
  - Notice the **Uncertainty** section: clearly alerts dispatchers that the campus building was not provided."

---

## ⏱️ Act 4: Duplicate Detection & Staff Dispatch (2:15 - 3:00)
- **Speaker:** "When multiple students report the same burst pipe in Science Hall, our duplicate detection engine immediately alerts the triage team."
- **Action:**
  1. Submit a report about Science Hall sink flooding.
  2. Notice the yellow duplicate banner: *'Potential Duplicate Report Detected (85% match with Ticket #rep-001)'*.
  3. Click on the ticket, assign to **Plumbing Lead Carlos M.**, set status to **'In Progress'**, and hit Save.
- **Closing:** "CampusFix AI bridges the gap between students and facilities with transparent, safe, and lightning-fast AI powered by Google Gemma. Thank you!"
