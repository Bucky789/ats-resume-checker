# 🚀 ATS Resume Checker
### **Local LLM-Powered, Deterministic Applicant Tracking System**

A 🔐 **privacy-first ATS resume analyzer** that evaluates how well a resume matches a job description directly from real job postings.

Unlike black-box AI tools, this system is designed to behave like a **real enterprise Applicant Tracking System (ATS)** by prioritizing job-driven skill extraction and deterministic scoring logic over unpredictable generative output.

---

## ✨ Key Features

* **🔍 Live Job Analysis:** Extract job descriptions directly from LinkedIn, company career pages (Greenhouse, Lever, etc.) without manual copy-pasting.
* **🧠 ATS-Realistic Scoring:** Skills are extracted dynamically from the job description. Required skills are weighted more heavily than preferred skills.
* **🤖 Local & Deterministic AI:** Uses **Ollama** (Phi-3) with `temperature: 0`. AI is restricted to experience refinement; core scoring remains rule-based and repeatable.
* **🧱 Quality Validation:** Rejects low-information resumes (e.g., just a name) to prevent artificial score inflation.
* **🔐 Privacy-First:** 100% local processing. No cloud APIs, no data leaks, no external resume uploads.
* **🐳 Dockerized Backend:** Reproducible environment for easy deployment on Windows, macOS, or Linux.

---

## 🏗️ System Architecture

1. **Chrome Extension:** Extracts JD from the active tab and sends it to the backend.
2. **Node.js Engine:** Normalizes text, cleans data, and extracts specific skills.
3. **Scoring Logic:** Applies weights based on "Required" vs "Preferred" keywords.
4. **Local LLM:** Provides a bounded bonus for experience relevance (via Ollama).

---

## 🛠️ Tech Stack

| Component | Technology |
| :--- | :--- |
| **Frontend** | Chrome Extension (Manifest V3), JavaScript, HTML, CSS |
| **Backend** | Node.js, Express.js |
| **AI / LLM** | Ollama (Phi-3), Deterministic Local Inference |
| **DevOps** | Docker, Git |

---

## ⚙️ How the Scoring Works

* **Job-Driven Extraction:** Only skills relevant to the specific job post are evaluated.
* **Normalization:** Map aliases (e.g., `Node.js` → `node`, `CI/CD` → `cicd`) to reduce false negatives.
* **Weighted Classification:** Keywords near "required" or "must-have" carry higher mathematical weight.
* **Bounded LLM Refinement:** The LLM provides a minor score adjustment based on the *relevance* of experience but cannot override the core skill match.

---

## 🚀 Getting Started

### 📌 Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Ollama](https://ollama.com/) installed and running

# 1. Setup the Backend

# Navigate to the backend folder
cd backend

# Build the Docker image
docker build -t ats-backend .

# Run the container
docker run -p 3000:3000 ats-backend
The backend will be live at http://localhost:3000.

# 2. Install the Chrome Extension
-Open Chrome and navigate to chrome://extensions/.

-Enable Developer Mode (top right).

-Click Load unpacked.

-Select the extension/ folder from this repository.

## 📊 Sample API Response
JSON

{
  "score": 82,
  "missing_skills": ["docker", "cicd"],
  "suggestions": [
    "Consider adding experience with docker",
    "Consider adding experience with cicd"
  ]
}

## 🧠 Design Philosophy

* Deterministic > Generative
* Job-specific > Generic skill lists
* Explainable logic > Black-box AI
* Local execution > Cloud dependency
* This system intentionally mirrors how enterprise ATS platforms operate internally.

## 🚧 Planned Enhancements

* Resume PDF / DOCX upload
* Section-wise scoring (Skills / Experience / Projects)
* Explainability UI (score breakdown)
* Resume auto-tailoring per job
* GitHub Actions CI pipeline

## 👤 Author
### Manthan Sumbhe 
Master’s Student in Computer Science
