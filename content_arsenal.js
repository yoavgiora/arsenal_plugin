runArsenalFlow();

function runArsenalFlow() {
  if (!clickInitialAddButton()) {
    return;
  }

  if (!selectHighToLowSort()) {
    return;
  }

  if (!clickFirstResultButton()) {
    return;
  }

  window.setTimeout(() => {
    if (!clickAdultButtonsForStandardTickets()) {
      return;
    }

    window.setTimeout(() => {
      if (!clickAddToBasketButton()) {
        return;
      }

      window.setTimeout(() => {
        sendBasketEmail();
      }, 500);
    }, 500);
  }, 1000);
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
  chrome.runtime.sendMessage({ action: "sendBasketEmail" }, (response) => {
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
  });
}
