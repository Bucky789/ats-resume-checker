chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "GET_JOB_DESC") {

    // Try common job description containers first
    const selectors = [
      "main",
      "article",
      "[role='main']",
      ".jobs-description",
      ".job-description",
      ".description",
      "#job-description"
    ];

    let text = "";

    for (const selector of selectors) {
      const el = document.querySelector(selector);
      if (el && el.innerText.length > 300) {
        text = el.innerText;
        break;
      }
    }

    // Fallback (last resort)
    if (!text) {
      text = document.body.innerText;
    }

    sendResponse({ text });
  }
});