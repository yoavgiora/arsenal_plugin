runArsenalFlow(window.__arsenalTicketCount === 1 ? 1 : 2);

function runArsenalFlow(ticketCount) {
  if (ticketCount === 2 && !clickInitialAddButton()) {
    return;
  }

  if (!selectHighToLowSort()) {
    return;
  }

  findAndOpenFirstResult(0, ticketCount);
}

function findAndOpenFirstResult(retryCount, ticketCount) {
  if (hasNoResultsMessage()) {
    console.log(`Arsenal extension: no tickets found, refreshing search (${retryCount + 1})`);
    refreshTicketSearch(retryCount, ticketCount);
    return;
  }

  if (!clickFirstResultButton()) {
    return;
  }

  runFlowSteps([
    waitStep(1000),
    actionStep(clickAdultButtonsForStandardTickets),
    waitStep(500),
    actionStep(clickAddToBasketButton),
    waitStep(500),
    actionStep(sendBasketEmail),
  ]);
}

function refreshTicketSearch(retryCount, ticketCount) {
  const firstNudge = ticketCount === 1 ? clickInitialAddButton : clickInitialRemoveButton;
  const secondNudge = ticketCount === 1 ? clickInitialRemoveButton : clickInitialAddButton;

  runFlowSteps([
    waitStep(1000),
    actionStep(firstNudge),
    waitStep(1000),
    actionStep(secondNudge),
    waitStep(1000),
    actionStep(() => {
      if (hasNoResultsMessage()) {
        runFlowSteps([
          waitStep(5000),
          actionStep(() => findAndOpenFirstResult(retryCount + 1, ticketCount)),
        ]);
        return false;
      }

      findAndOpenFirstResult(retryCount + 1, ticketCount);
      return false;
    }),
  ]);
}

function clickInitialAddButton() {
  const addButton = document.querySelector(".tickets-quantity_add");

  if (!addButton) {
    console.error("Arsenal extension: add button not found");
    return false;
  }

  addButton.click();
  return true;
}

function clickInitialRemoveButton() {
  const removeButton = document.querySelector(".tickets-quantity_remove");

  if (!removeButton) {
    console.error("Arsenal extension: remove button not found");
    return false;
  }

  removeButton.click();
  return true;
}

function selectHighToLowSort() {
  const sortSelect = document.querySelector('select[aria-label="Sort by Price"]');

  if (!sortSelect) {
    console.error("Arsenal extension: sort select not found");
    return false;
  }

  sortSelect.value = "EDP_SIM_Search_Results_Dropdown_Price_Descending{uneditable}";
  sortSelect.dispatchEvent(new Event("change", { bubbles: true }));
  return true;
}

function clickFirstResultButton() {
  const resultsSection = document.querySelector(".choose-areas-results__body--results__items");

  if (!resultsSection) {
    console.error("Arsenal extension: results section not found");
    return false;
  }

  const firstResultButton = resultsSection.querySelector(
    ".choose-areas-results__body--results__items--item",
  );

  if (!firstResultButton) {
    console.error("Arsenal extension: first result button not found");
    return false;
  }

  firstResultButton.click();
  return true;
}

function hasNoResultsMessage() {
  return Boolean(document.querySelector(".error-noResultsFound"));
}

function clickAdultButtonsForStandardTickets() {
  const standardTicketCards = Array.from(
    document.querySelectorAll(".seatCard__seat-card-selection"),
  ).filter((card) => {
    const title = card.querySelector(".seatCard__seat-card-selection__title-description");
    return title?.textContent?.trim() === "Standard Ticket";
  });

  if (standardTicketCards.length === 0) {
    console.error("Arsenal extension: standard ticket cards not found");
    return false;
  }

  standardTicketCards.forEach((card) => {
    const firstPlusButton = card.querySelector(".tickets-quantity_add");

    if (!firstPlusButton) {
      console.error("Arsenal extension: adult plus button not found for a standard ticket");
      return;
    }

    firstPlusButton.click();
  });

  return true;
}

function clickAddToBasketButton() {
  const addToBasketButton = Array.from(
    document.querySelectorAll("button.button.button_transactional[type='submit']"),
  ).find((button) => button.textContent?.trim() === "ADD TO BASKET");

  if (!addToBasketButton) {
    console.error("Arsenal extension: add to basket button not found");
    return false;
  }

  addToBasketButton.click();
  return true;
}

function sendBasketEmail() {
  chrome.runtime.sendMessage(
    { action: "sendBasketEmail", email: window.__arsenalEmail },
    (response) => {
      if (chrome.runtime.lastError) {
        console.error(
          "Arsenal extension: failed to send basket email",
          chrome.runtime.lastError.message,
        );
        return;
      }

      if (!response?.ok) {
        console.error("Arsenal extension: basket email rejected", response);
      }
    },
  );
}
