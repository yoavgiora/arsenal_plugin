const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbxKFtC09W96uXfW4khGKV501QjH-WCDiCmH6Fjw852ijK5-6xibRvvaei05yXJ_q47I/exec";
const SHARED_SECRET = "ee09cf302c9d8406f2bbddacc3c2a109983eac41c89a6cefbe581a428e48438b";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action !== "sendBasketEmail") {
    return false;
  }

  fetch(APPS_SCRIPT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      secret: SHARED_SECRET,
      subject: "Tickets in basket",
      body: "Tickets were added to the basket.",
    }),
  })
    .then(async (response) => {
      const responseText = await response.text();
      sendResponse({ ok: response.ok, responseText });
    })
    .catch((error) => {
      console.error("Arsenal extension: Apps Script email request failed", error);
      sendResponse({ ok: false, error: String(error) });
    });

  return true;
});

chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id) {
    return;
  }

  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ["content_arsenal.js"],
  });
});
