const TRANSLATION_POPUP_ID = "word-fly-translation-popup";
const currentDomain = window.location.hostname;

function showTranslation(text, x, y) {
  let popup = document.getElementById(TRANSLATION_POPUP_ID);
  if (popup) {
    popup.remove();
  }

  popup = document.createElement("div");
  popup.id = TRANSLATION_POPUP_ID;
  popup.style.cssText = `
        position: absolute;
        top: ${y + 15}px;
        left: ${x}px;
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
    }
  );
}

function checkActivationAndRun(selectedText, x, y) {
  chrome.storage.sync.get("enabledDomains", (data) => {
    const enabledDomains = data.enabledDomains || [];

    if (!enabledDomains.includes(currentDomain)) {
      console.log(
        `Word-Fly: Translation disabled on this domain (${currentDomain})`
      );
      return;
    }
    showTranslation(selectedText, x, y);
  });
}

document.addEventListener("mouseup", (event) => {
  const selection = window.getSelection();
  const selectedText = selection.toString().trim();

  if (selectedText.length > 3) {
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    const x = window.scrollX + rect.left;
    const y = window.scrollY + rect.bottom;

    checkActivationAndRun(selectedText, x, y);
  }
});

document.addEventListener("click", (event) => {
  const popup = document.getElementById(TRANSLATION_POPUP_ID);
  if (popup && !event.target.closest(`#${TRANSLATION_POPUP_ID}`)) {
    popup.remove();
  }
});
