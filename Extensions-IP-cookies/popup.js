async function getCurrentTab() {
  let queryOptions = { active: true, currentWindow: true };
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

async function getIP(domain) {

  let response = await fetch("https://dns.google/resolve?name=" + domain);

  let data = await response.json();

  if(data.Answer){
    return data.Answer[0].data;
  }

  return "IP non trouvée";
}

async function analyzeSite(){


  let tab = await getCurrentTab();
  let url = new URL(tab.url);
  let domain = url.hostname;
  let ip = await getIP(domain);
  document.getElementById("ip").textContent = ip;

  chrome.cookies.getAll({domain: domain}, function(cookies) {
    let list = document.getElementById("cookies");
    cookies.forEach(cookie => {
      let li = document.createElement("li");
      li.textContent = cookie.name + " = " + cookie.value;
      list.appendChild(li);
    });
  });

  // Analyse des en-têtes de sécurité
  fetch(tab.url, { method: 'HEAD' })
    .then(response => {
      const headers = [
        "Content-Security-Policy",
        "Strict-Transport-Security",
        "X-Frame-Options",
        "X-Content-Type-Options",
        "Referrer-Policy",
        "Permissions-Policy",
        "Cross-Origin-Resource-Policy",
        "Cross-Origin-Embedder-Policy",
        "Cross-Origin-Opener-Policy"
      ];
      let headerList = document.getElementById("security-headers");
      headerList.innerHTML = "";
      headers.forEach(header => {
        let value = response.headers.get(header);
        let li = document.createElement("li");
        li.textContent = header + ": " + (value ? value : "Non présent");
        headerList.appendChild(li);
      });
    })
    .catch(() => {
      let headerList = document.getElementById("security-headers");
      headerList.innerHTML = "Impossible d'analyser les en-têtes.";
    });
}

analyzeSite();