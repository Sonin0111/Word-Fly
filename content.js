const TRANSLATION_POPUP_ID = "word-fly-translation-popup";
const currentDomain = window.location.hostname;

function positionPopup(popup, rect) {
  const popupHeight = popup.offsetHeight;
  const gap = 15;

  const spaceBelow = window.innerHeight - rect.bottom;
  let top;

  if (spaceBelow < popupHeight + gap && rect.top > popupHeight + gap) {
    top = window.scrollY + rect.top - popupHeight - gap;
  } else if (spaceBelow < popupHeight + gap) {
    top = Math.max(window.scrollY + 5, window.scrollY + rect.top - popupHeight - gap);
  } else {
    top = window.scrollY + rect.bottom + gap;
  }

  popup.style.top = `${top}px`;
  popup.style.left = `${window.scrollX + rect.left}px`;
}

function showTranslation(text, rect) {
  let popup = document.getElementById(TRANSLATION_POPUP_ID);
  if (popup) {
    popup.remove();
  }

  popup = document.createElement("div");
  popup.id = TRANSLATION_POPUP_ID;
  popup.style.cssText = `
        position: absolute;
        max-width: 300px;
        padding: 8px 12px;
        background-color: #333;
        color: white;
        border-radius: 7px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        z-index:99999;
        font-family: sans-serif;
        font-size: 14px;
        line-height: 1.4;
        cursor: pointer;
        `;
  popup.textContent = "Translating...";

  document.body.appendChild(popup);
  positionPopup(popup, rect);

  popup.addEventListener("click", () => popup.remove());

  chrome.runtime.sendMessage(
    { action: "translate", text: text },
    (response) => {
      if (response && response.translation) {
        popup.textContent = response.translation;
      } else {
        popup.textContent = "Unable to get translation.";
        console.error(
          "Word-Fly: No response from background script.",
          response
        );
      }
      positionPopup(popup, rect);
    }
  );
}

function checkActivationAndRun(selectedText, rect) {
  chrome.storage.sync.get("enabledDomains", (data) => {
    const enabledDomains = data.enabledDomains || [];

    if (!enabledDomains.includes(currentDomain)) {
      console.log(
        `Word-Fly: Translation disabled on this domain (${currentDomain})`
      );
      return;
    }
    showTranslation(selectedText, rect);
  });
}

document.addEventListener("mouseup", (event) => {
  if (!event.ctrlKey) {
    return;
  }
  const selection = window.getSelection();
  const selectedText = selection.toString().trim();

  if (selectedText.length > 3 && selectedText.length < 500) {
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    checkActivationAndRun(selectedText, rect);
  }
});

document.addEventListener("click", (event) => {
  const popup = document.getElementById(TRANSLATION_POPUP_ID);
  if (popup && !event.target.closest(`#${TRANSLATION_POPUP_ID}`)) {
    popup.remove();
  }
});
