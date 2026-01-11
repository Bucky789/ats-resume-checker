import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

/* =====================================================
   1. Skill Normalization (aliases & equivalence)
===================================================== */

const SKILL_ALIASES = {
  "spring boot": "spring",
  "node.js": "node",
  "react.js": "react",
  javascript: "javascript",
  typescript: "typescript",
  "amazon web services": "aws",
  restful: "rest",
  "rest api": "rest",
  "ci/cd": "cicd",
  "continuous integration": "cicd",
  "continuous deployment": "cicd",
  github: "git",
  mysql: "sql",
  postgresql: "sql",
  mariadb: "sql",
};

function normalizeText(text = "") {
  let t = text.toLowerCase();
  for (const [alias, canonical] of Object.entries(SKILL_ALIASES)) {
    t = t.replaceAll(alias, canonical);
  }
  return t;
}

/* =====================================================
   2. Job Description Cleanup (remove noise)
===================================================== */

function cleanJobText(text = "") {
  return text
    .replace(/equal opportunity employer[\s\S]*/gi, "")
    .replace(/benefits include[\s\S]*/gi, "")
    .replace(/about us[\s\S]*/gi, "")
    .replace(/we offer[\s\S]*/gi, "")
    .replace(/\n{2,}/g, "\n")
    .slice(0, 5000);
}

/* =====================================================
   3. ATS Skill Vocabulary (what ATS actually tracks)
===================================================== */

const SKILL_VOCABULARY = [
  // languages
  "java",
  "c",
  "c++",
  "python",
  "javascript",
  "typescript",
  // frameworks / runtime
  "spring",
  "node",
  "react",
  // web
  "html",
  "css",
  "rest",
  "api",
  // databases
  "sql",
  "mongodb",
  "db2",
  // tooling
  "git",
  "cicd",
  "docker",
  "kubernetes",
  // platforms
  "linux",
  "windows",
  // methodology
  "agile",
  "scrum",
  "devops",
  // cloud
  "aws",
  "cloud",
  // architecture
  "microservices",
];

/* =====================================================
   4. Job-Driven Skill Extraction (KEY FIX)
===================================================== */

function extractJobSkills(jobText) {
  const found = new Set();
  for (const skill of SKILL_VOCABULARY) {
    if (jobText.includes(skill)) {
      found.add(skill);
    }
  }
  return [...found];
}

function extractResumeSkills(resumeText, jobSkills) {
  return jobSkills.filter((skill) => resumeText.includes(skill));
}

/* =====================================================
   5. Required vs Preferred Heuristic
===================================================== */
function escapeRegex(text = "") {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function splitRequiredPreferred(jobSkills, jobText) {
  const required = [];
  const preferred = [];

  for (const skill of jobSkills) {
    const escapedSkill = escapeRegex(skill);

    const pattern = new RegExp(
      `(required|must have|expertise)[\\s\\S]*${escapedSkill}|${escapedSkill}[\\s\\S]*(required|must have|expertise)`,
      "i"
    );

    if (pattern.test(jobText)) {
      required.push(skill);
    } else {
      preferred.push(skill);
    }
  }

  return { required, preferred };
}

/* =====================================================
   6. Deterministic ATS Scoring (CORE LOGIC)
===================================================== */

function deterministicATSScore(resumeText, jobText) {
  const jobSkills = extractJobSkills(jobText);
  const { required, preferred } = splitRequiredPreferred(jobSkills, jobText);

  const matched = extractResumeSkills(resumeText, jobSkills);
  const missing = jobSkills.filter((s) => !matched.includes(s));

  // weights
  const REQUIRED_WEIGHT = 0.7;
  const PREFERRED_WEIGHT = 0.3;

  const reqMatched = required.filter((s) => matched.includes(s)).length;
  const prefMatched = preferred.filter((s) => matched.includes(s)).length;

  const reqScore = required.length ? reqMatched / required.length : 1;

  const prefScore = preferred.length ? prefMatched / preferred.length : 1;

  const finalScore = Math.round(
    (reqScore * REQUIRED_WEIGHT + prefScore * PREFERRED_WEIGHT) * 100
  );

  return {
    score: finalScore,
    missing_skills: missing,
  };
}

/* =====================================================
   7. Resume Quality Gate (fail fast)
===================================================== */

function isLowInformationResume(text) {
  const wordCount = text.split(/\s+/).length;
  return wordCount < 30;
}

/* =====================================================
   8. ATS Endpoint
===================================================== */

app.post("/ats-check", async (req, res) => {
  const { resume, job } = req.body;

  if (!resume || !job) {
    return res.status(400).json({
      error: "Resume and job description are required",
    });
  }

  const normalizedResume = normalizeText(resume);
  const normalizedJob = cleanJobText(normalizeText(job));

  // hard fail for garbage resumes
  if (isLowInformationResume(normalizedResume)) {
    return res.json({
      score: 5,
      missing_skills: ["Resume lacks sufficient technical detail"],
      suggestions: [
        "Add a technical skills section",
        "Include projects or work experience",
        "Mention technologies you have used",
      ],
    });
  }

  // deterministic ATS score
  const deterministic = deterministicATSScore(normalizedResume, normalizedJob);

  // optional LLM refinement (bounded, deterministic)
  let llmBonus = 0;

  try {
    const prompt = `
You are an ATS assistant.
Evaluate overall experience relevance ONLY.
Return JSON: { "bonus": number (0-10) }

Resume:
${normalizedResume}

Job:
${normalizedJob}
`;

    const ollamaResponse = await fetch("http://host.docker.internal:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "phi3",
        prompt,
        stream: false,
        options: { temperature: 0 },
      }),
    });

    const data = await ollamaResponse.json();
    const match = data.response.match(/\{[\s\S]*\}/);

    if (match) {
      const parsed = JSON.parse(match[0]);
      if (typeof parsed.bonus === "number") {
        llmBonus = Math.min(parsed.bonus, 10);
      }
    }
  } catch {
    // LLM failure should NEVER break ATS
  }

  const finalScore = Math.min(95, Math.max(0, deterministic.score + llmBonus));

  res.json({
    score: finalScore,
    missing_skills: deterministic.missing_skills,
    suggestions: deterministic.missing_skills.length
      ? deterministic.missing_skills.map(
          (s) => `Consider adding experience with ${s}`
        )
      : ["Your resume aligns well with this role"],
  });
});

/* =====================================================
   9. Server Start
===================================================== */

app.listen(3000, () => {
  console.log("✅ ATS backend running at http://localhost:3000");
});
