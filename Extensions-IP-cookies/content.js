
(async function() {
	// Création du panneau
	const panel = document.createElement('div');
	panel.id = 'ip-cookie-security-panel';
	panel.style.position = 'fixed';
	panel.style.top = '20px';
	panel.style.right = '20px';
	panel.style.zIndex = '99999';
	panel.style.width = '340px';
	panel.style.background = '#fff';
	panel.style.borderRadius = '12px';
	panel.style.boxShadow = '0 2px 16px rgba(44,62,80,0.18)';
	panel.style.padding = '18px 14px';
	panel.style.fontFamily = "'Segoe UI', Arial, sans-serif";
	panel.style.color = '#222';
	panel.style.maxHeight = '80vh';
	panel.style.overflowY = 'auto';
	panel.style.fontSize = '1em';

	panel.innerHTML = `
		<h2 style="margin-top:0">IP & Cookies</h2>
		<div><strong>IP :</strong> <span id="panel-ip">...</span></div>
		<div style="margin-top:12px"><strong>Cookies :</strong></div>
		<ul id="panel-cookies"></ul>
		<div style="margin-top:12px"><strong>En-têtes sécurité :</strong></div>
		<ul id="panel-security-headers"></ul>
		<button id="panel-close" style="margin-top:14px;float:right">Fermer</button>
	`;
	document.body.appendChild(panel);

	document.getElementById('panel-close').onclick = () => panel.remove();

	// IP
	const domain = window.location.hostname;
	fetch("https://dns.google/resolve?name=" + domain)
		.then(r => r.json())
		.then(data => {
			document.getElementById("panel-ip").textContent = (data.Answer ? data.Answer[0].data : "IP non trouvée");
		})
		.catch(() => {
			document.getElementById("panel-ip").textContent = "Erreur";
		});

	// Cookies
	chrome.runtime.sendMessage({type: "getCookies", domain}, function(cookies) {
		let list = document.getElementById("panel-cookies");
		if (cookies && cookies.length) {
			cookies.forEach(cookie => {
				let li = document.createElement("li");
				li.textContent = cookie.name + " = " + cookie.value;
				list.appendChild(li);
			});
		} else {
			list.innerHTML = '<li>Aucun cookie</li>';
		}
	});

	// En-têtes sécurité
	fetch(window.location.href, { method: 'HEAD' })
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
			let headerList = document.getElementById("panel-security-headers");
			headerList.innerHTML = "";
			headers.forEach(header => {
				let value = response.headers.get(header);
				let li = document.createElement("li");
				li.textContent = header + ": " + (value ? value : "Non présent");
				headerList.appendChild(li);
			});
		})
		.catch(() => {
			let headerList = document.getElementById("panel-security-headers");
			headerList.innerHTML = "Impossible d'analyser les en-têtes.";
		});
})();
