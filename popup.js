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

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const url = new URL(tabs[0].url);
    const domain = url.hostname;
    domainSpan.textContent = domain;

    chrome.storage.sync.get("enabledDomains", (data) => {
      let enabledDomains = data.enabledDomains || [];
      toggleCheckbox.checked = enabledDomains.includes(domain);
    });

    toggleCheckbox.addEventListener("change", () =>{
      chrome.storage.sync.get("enabledDomains",(data) => {
        let enabledDomains = data.enabledDomains || [];

        if (toggleCheckbox.checked) {
          if (!enabledDomains.includes(domain)){
            enabledDomains.push(domain);
          }
        }else{
          enabledDomains = enabledDomains.filter(d => d !== domain);
        }

        chrome.storage.sync.set({ enabledDomains}, () => {
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
  });

  function updateSiteList(domains) {
    siteList.innerHTML = "";
    if (domains.length === 0){
      siteList.innerHTML = "<li>No enabled sites</li>";
      return;
    }
    domains.forEach(domain => {
      const li = document.createElement("li");
      li.textContent = domain;
      siteList.appendChild(li);
    });
  }

});
