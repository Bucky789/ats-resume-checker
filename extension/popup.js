const checkBtn = document.getElementById("check");
const loadingText = document.getElementById("loading");
const resultDiv = document.getElementById("result");

checkBtn.addEventListener("click", async () => {
  const resumeText = document.getElementById("resume").value.trim();

  if (!resumeText) {
    alert("Please paste your resume first.");
    return;
  }

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
        if (chrome.runtime.lastError) {
          showError("Content script not loaded. Refresh the page.");
          return;
        }

        if (!response || !response.text || response.text.length < 300) {
          showError("Could not extract a valid job description.");
          return;
        }

        try {
          const res = await fetch("http://localhost:3000/ats-check", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              resume: resumeText,
              job: response.text
            })
          });

          const data = await res.json();
          renderResult(data);

        } catch {
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
    data.missing_skills.map(s => `<li>${s}</li>`).join("");

  document.getElementById("suggestions").innerHTML =
    data.suggestions.map(s => `<li>${s}</li>`).join("");
}

function showError(message) {
  loadingText.classList.add("hidden");
  checkBtn.disabled = false;
  alert(message);
}
