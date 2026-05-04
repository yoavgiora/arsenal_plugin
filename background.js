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
      to: message.email,
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

  const [promptInjection] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      const input = window.prompt("How many tickets? Enter 1 or 2:", "2");
      if (input === null) {
        return null;
      }
      const value = input.trim();
      if (value === "1" || value === "2") {
        return Number(value);
      }
      window.alert("Arsenal extension: please enter 1 or 2.");
      return null;
    },
  });

  const ticketCount = promptInjection?.result;
  if (ticketCount !== 1 && ticketCount !== 2) {
    return;
  }

  const [emailInjection] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      const input = window.prompt(
        "Send confirmation email to:",
        "justinlewis1@hotmail.com",
      );
      if (input === null) {
        return null;
      }
      const value = input.trim();
      if (!value.includes("@")) {
        window.alert("Arsenal extension: please enter a valid email address.");
        return null;
      }
      return value;
    },
  });

  const email = emailInjection?.result;
  if (!email) {
    return;
  }

  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: (count, mail) => {
      window.__arsenalTicketCount = count;
      window.__arsenalEmail = mail;
    },
    args: [ticketCount, email],
  });

  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ["steps.js", "content_arsenal.js"],
  });
});
