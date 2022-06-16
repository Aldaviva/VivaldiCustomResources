window.addEventListener("DOMContentLoaded", event => {
	const parent = document.body;
	const observer = new MutationObserver(onMutation);
	observer.observe(parent, {
		subtree: true,
		childList: true
	});

	function onMutation(mutations, observer){
		const vivaldiSubscribeButton = document.querySelector("header form input[type=button]");
		if(vivaldiSubscribeButton !== null){
			vivaldiSubscribeButton.value = "Subscribe with Vivaldi";

			const inoreaderSubscribeButton = document.createElement("input");
			inoreaderSubscribeButton.type = "button";
			inoreaderSubscribeButton.value = "Subscribe with Inoreader";
			inoreaderSubscribeButton.onclick = event => {
				window.open("https://www.inoreader.com/search/feeds/" + window.encodeURIComponent(document.baseURI));
			};
			inoreaderSubscribeButton.style.marginLeft = "8px";

			vivaldiSubscribeButton.parentElement.appendChild(inoreaderSubscribeButton);
			observer.disconnect();
		}
	}
});