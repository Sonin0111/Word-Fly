document.addEventListener("DOMContentLoaded", () => {
  const langSelect = document.getElementById("targetLang");
  const toggleCheckbox = document.getElementById("toggleSite");
  const domainSpan = document.getElementById("currentDomain");
  const langNote = langSelect.closest(".setting-block").querySelector(".note");
  const toggleNote = toggleCheckbox
    .closest(".setting-block")
    .querySelector(".note");

  const siteListContainer = document.getElementById("enabledSitesContainer");
  const siteList = document.getElementById("enabledSites");
  const toggleListBtn = document.getElementById("toggleListBtn");

  const apiKeyInput = document.getElementById("deeplApiKey");
  const saveApiKeyBtn = document.getElementById("saveApiKeyBtn");
  const apiKeyNote = document.getElementById("apiKeyNote");

  chrome.storage.sync.get("deeplApiKey", (data) => {
    if (data.deeplApiKey) {
      apiKeyInput.value = data.deeplApiKey;
    }
  });

  function saveApiKey() {
    const key = apiKeyInput.value.trim();
    chrome.storage.sync.set({ deeplApiKey: key }, () => {
      apiKeyNote.style.opacity = "1";
      setTimeout(() => (apiKeyNote.style.opacity = "0"), 1500);
    });
  }

  saveApiKeyBtn.addEventListener("click", saveApiKey);
  apiKeyInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      saveApiKey();
    }
  });

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const url = new URL(tabs[0].url);
    const domain = url.hostname;
    domainSpan.textContent = domain;

    chrome.storage.sync.get("enabledDomains", (data) => {
      let enabledDomains = data.enabledDomains || [];
      toggleCheckbox.checked = enabledDomains.includes(domain);
    });

    toggleCheckbox.addEventListener("change", () => {
      chrome.storage.sync.get("enabledDomains", (data) => {
        let enabledDomains = data.enabledDomains || [];

        if (toggleCheckbox.checked) {
          if (!enabledDomains.includes(domain)) {
            enabledDomains.push(domain);
          }
        } else {
          enabledDomains = enabledDomains.filter((d) => d !== domain);
        }

        chrome.storage.sync.set({ enabledDomains }, () => {
          updateSiteList(enabledDomains);
          toggleNote.style.opacity = "1";
          setTimeout(() => (toggleNote.style.opacity = "0"), 1500);
        });
      });
    });
  });

  chrome.storage.sync.get("targetLang", (data) => {
    langSelect.value = data.targetLang || "UK";
  });

  langSelect.addEventListener("change", () => {
    chrome.storage.sync.set({ targetLang: langSelect.value }, () => {
      langNote.style.opacity = "1";
      setTimeout(() => (langNote.style.opacity = "0"), 1500);
    });
  });

  toggleListBtn.addEventListener("click", () => {
    siteListContainer.classList.toggle("hidden");

    if (!siteListContainer.classList.contains("hidden")) {
      chrome.storage.sync.get("enabledDomains", (data) => {
        updateSiteList(data.enabledDomains || []);
      });
    }
  });

  function updateSiteList(domains) {
    siteList.innerHTML = "";
    if (domains.length === 0) {
      siteList.innerHTML = "<li>No enabled sites</li>";
      return;
    }
    domains.forEach((domain) => {
      const li = document.createElement("li");
      li.className = "site-item";
      
      const domainSpan = document.createElement("span");
      domainSpan.textContent = domain;
      domainSpan.className = "domain-name";
      
      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "×";
      deleteBtn.className = "delete-btn";
      deleteBtn.title = "Видалити сайт";
      
      deleteBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        removeSite(domain);
      });
      
      li.appendChild(domainSpan);
      li.appendChild(deleteBtn);
      siteList.appendChild(li);
    });
  }

  function removeSite(domain) {
    chrome.storage.sync.get("enabledDomains", (data) => {
      let enabledDomains = data.enabledDomains || [];
      enabledDomains = enabledDomains.filter((d) => d !== domain);
      
      chrome.storage.sync.set({ enabledDomains }, () => {
        updateSiteList(enabledDomains);
        toggleNote.style.opacity = "1";
        toggleNote.textContent = `Сайт ${domain} видаленно!`;
        setTimeout(() => {
          toggleNote.style.opacity = "0";
          toggleNote.textContent = "Налаштування застосовано!";
        }, 1500);
      });
    });
  }
});
