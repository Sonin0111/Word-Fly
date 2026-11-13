import { CONFIG } from "./config.js";

const DEFAULT_DEEPL_API_KEY = CONFIG.DEEPL_API_KEY;

const DEEPL_URL = "https://api-free.deepl.com/v2/translate";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "translate") {
    const textToTranslate = request.text;

    chrome.storage.sync.get(["targetLang", "deeplApiKey"], (data) => {
      const targetLang = data.targetLang || "UK";
      const apiKey =
        (data.deeplApiKey && data.deeplApiKey.trim()) || DEFAULT_DEEPL_API_KEY;

      if (!apiKey) {
        sendResponse({
          translation: "Please add your DeepL API key in the extension settings.",
        });
        return;
      }

      const params = new URLSearchParams({
        text: textToTranslate,
        target_lang: targetLang,
      });

      fetch(DEEPL_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": `DeepL-Auth-Key ${apiKey}`,
        },
        body: params,
      })
        .then((response) => response.json())
        .then((data) => {
          let translatedText = "Translation Error, try again later.";
          if (data.translations && data.translations.length > 0) {
            translatedText = data.translations[0].text;
          } else if (data.message) {
            translatedText = "DEEPL API Error: " + data.message;
          }

          sendResponse({ translation: translatedText });
        })
        .catch((error) => {
          console.error("DEEPL API Error:", error);
          sendResponse({ translation: `Request failed: ${error.message}` });
        });
    });

    return true;
  }
});
