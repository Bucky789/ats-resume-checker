# ATS Resume Checker  
**Local LLM-Powered, Deterministic Applicant Tracking System**

A **privacy-first ATS resume analyzer** that evaluates how well a resume matches a job description directly from real job postings.

Unlike black-box AI tools, this system is designed to behave like a **real Applicant Tracking System (ATS)**:
- Job-driven skill extraction
- Deterministic, repeatable scoring
- Required vs preferred skill weighting
- AI used only as a bounded refinement layer

All processing runs **locally** — no cloud APIs, no resume data leaving the machine.

---

## ✨ Key Features

### 🔍 Live Job Analysis
- Analyze job descriptions directly from:
  - LinkedIn
  - Company career pages
  - Greenhouse / Lever job postings
- No manual copy-paste of job descriptions required

### 🧠 ATS-Realistic Scoring
- Skills are extracted **from the job description**, not from a static global list
- Required skills are weighted more heavily than preferred skills
- Same resume + same job → **same score every time**

### 🤖 Local LLM (Bounded & Deterministic)
- Uses a lightweight **local LLM via Ollama**
- LLM is restricted to experience relevance refinement
- Core scoring logic is **rule-based**, not generative
- Temperature set to `0` to eliminate randomness

### 🧱 Resume Quality Validation
- Low-information resumes (e.g., only a name) are rejected
- Prevents artificially inflated ATS scores

### 🔐 Privacy-First by Design
- No cloud APIs
- No external resume uploads
- All inference runs locally

### 🐳 Dockerized Backend
- Reproducible environment
- Easy setup on any machine with Docker
- Clean separation of backend and frontend

---

## 🏗️ System Architecture

Chrome Extension
├─ Extracts job description from active tab
├─ Accepts resume text
↓
Node.js Backend (Dockerized)
├─ Normalize & clean job text
├─ Extract job-specific skills
├─ Identify required vs preferred skills
├─ Apply deterministic ATS scoring
├─ Use local LLM for bounded refinement
↓
ATS Score + Missing Skills + Suggestions

markdown
Copy code

---

## 🛠️ Tech Stack

### Frontend
- Chrome Extension (Manifest V3)
- JavaScript, HTML, CSS

### Backend
- Node.js
- Express.js
- Deterministic ATS scoring logic

### AI / LLM
- **Ollama** (local inference)
- Lightweight instruction-tuned model (Phi-3)
- Temperature = 0 for deterministic output

### DevOps & Tooling
- Docker (backend containerization)
- Git & GitHub (version control)
- Windows / macOS compatible

---

## ⚙️ How ATS Scoring Works

### 1️⃣ Job-Driven Skill Extraction
- Skills are extracted directly from the job description
- Only job-relevant skills are evaluated

### 2️⃣ Skill Normalization
- Handles aliases and variants:
  - `Spring Boot → Spring`
  - `CI/CD → cicd`
  - `Node.js → node`
- Reduces false negatives

### 3️⃣ Required vs Preferred Classification
- Skills appearing near phrases like:
  - “required”
  - “must have”
  - “expertise”
- are treated as **required**
- Required skills carry higher weight

### 4️⃣ Deterministic Core Scoring
- Rule-based, stable, repeatable
- No randomness between runs
- Mirrors real ATS behavior

### 5️⃣ Bounded LLM Refinement
- Local LLM provides a **small bonus** for experience relevance
- Cannot override skill mismatches
- Output is clamped to prevent score inflation

---

## 🐳 Running the Backend (Docker)

### Prerequisites
- Docker Desktop
- Ollama installed and running locally

### Build the Docker image
```bash
cd backend
docker build -t ats-backend .
Run the container
bash
Copy code
docker run -p 3000:3000 ats-backend
Backend will be available at:

arduino
Copy code
http://localhost:3000
🧩 Chrome Extension Setup
Open Chrome

Navigate to chrome://extensions

Enable Developer Mode

Click Load unpacked

Select the extension/ folder

Open a job posting, click the extension, paste your resume, and run the ATS check.

📊 Sample API Response
json
Copy code
{
  "score": 82,
  "missing_skills": ["docker", "cicd"],
  "suggestions": [
    "Consider adding experience with docker",
    "Consider adding experience with cicd"
  ]
}
🧠 Design Philosophy
Deterministic > Generative

Job-specific > Generic skill lists

Explainable logic > Black-box AI

Local execution > Cloud dependency

This system intentionally mirrors how enterprise ATS platforms operate internally.

🚧 Planned Enhancements
Resume PDF / DOCX upload

Section-wise scoring (Skills / Experience / Projects)

Explainability UI (score breakdown)

Resume auto-tailoring per job

GitHub Actions CI pipeline

👤 Author
Manthan Sumbhe
Master’s Student in Computer Science