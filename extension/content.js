chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
  if (req.type === "GET_JOB_DESC") {
    sendResponse({
      text: document.body.innerText
    });
  }
});
