const checkBtn = document.getElementById("check");
const loadingText = document.getElementById("loading");
const resultDiv = document.getElementById("result");

checkBtn.addEventListener("click", async () => {
  const resumeText = document.getElementById("resume").value.trim();

  if (!resumeText) {
    alert("Please paste your resume first.");
    return;
  }

  // Reset UI
  resultDiv.classList.add("hidden");
  loadingText.classList.remove("hidden");
  checkBtn.disabled = true;

  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    if (!tabs || !tabs[0]?.id) {
      showError("No active tab found.");
      return;
    }

    chrome.tabs.sendMessage(
      tabs[0].id,
      { type: "GET_JOB_DESC" },
      async response => {
        // 🔒 GUARD #1
        if (!response || !response.text) {
          showError("Could not read job description from this page.");
          return;
        }

        try {
          // 🔒 GUARD #2 — fetch only when backend URL is valid
          const backendURL = "http://localhost:3000/ats-check";
          if (!backendURL) {
            showError("Backend URL missing.");
            return;
          }

          const res = await fetch(backendURL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              resume: resumeText,
              job: response.text
            })
          });

          const data = await res.json();
          renderResult(data);

        } catch (err) {
          showError("Failed to connect to backend.");
        }
      }
    );
  });
});

function renderResult(data) {
  loadingText.classList.add("hidden");
  checkBtn.disabled = false;

  resultDiv.classList.remove("hidden");
  document.getElementById("score").innerText =
    `ATS Score: ${data.score}%`;

  document.getElementById("missing").innerHTML =
    data.missing_skills.map(skill => `<li>${skill}</li>`).join("");

  document.getElementById("suggestions").innerHTML =
    data.suggestions.map(s => `<li>${s}</li>`).join("");
}

function showError(message) {
  loadingText.classList.add("hidden");
  checkBtn.disabled = false;
  alert(message);
}
