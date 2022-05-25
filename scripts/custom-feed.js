window.addEventListener("DOMContentLoaded", event => {
	setTimeout(() => {
		const vivaldiSubscribeButton = document.querySelector("header form input[type=button]");
		vivaldiSubscribeButton.value = "Subscribe with Vivaldi";

		const inoreaderSubscribeButton = document.createElement("input");
		inoreaderSubscribeButton.type = "button";
		inoreaderSubscribeButton.value = "Subscribe with Inoreader";
		inoreaderSubscribeButton.onclick = event => {
			window.open("https://www.inoreader.com/search/feeds/" + window.encodeURIComponent(document.baseURI));
		};
		inoreaderSubscribeButton.style.marginLeft = "8px";

		vivaldiSubscribeButton.parentElement.appendChild(inoreaderSubscribeButton);
	}, 20);
});