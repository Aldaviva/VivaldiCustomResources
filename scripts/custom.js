/*
 * This function adds custom keyboard shortcuts.
 *  -  Ctrl+Shift+C: Copy current page location to clipboard
 *     There are Chromium extensions that do this, but Vivaldi's extension keyboard shortcut handling is not working properly in 2.3.
 *  -  Ctrl+Alt+Shift+V: Paste and Go in new tab
 *  -  Ctrl+E: Toggle the address bar Extension Visibility preference between "Toggle Only Hidden Extensions" and "Toggle All Extensions"
 *  -  Alt+H: Hibernate background tabs
 *  -  Alt+Z: Open History Back menu, as if you right-clicked the Back button
 *  -  Alt+X: Open History Forward menu, as if you right-clicked the Forward button
 *
 * Keyboard Machine source: https://forum.vivaldi.net/topic/33122/custom-keyboard-shortcuts-mod
 * Vivaldi developer tools: vivaldi.exe --debug-packed-apps
 */

/**
 * Keyboard Machine, a Mod for Vivaldi
 * Make custom shortcuts that do stuff™ and use them in the vivaldi UI
 * Based on "button machine". NO COPYRIGHT RESERVED. lonm.vivaldi.net
 * Version 1.0.0
 */

(function keyboardMachine(){
	/**
	 * key: String of what keys to press - written in the form "Ctrl+Shift+Alt+Key"
	 */
	const SHORTCUT_HANDLERS = {
		"Ctrl+Shift+C": copyCurrentPageUrl,
		"Ctrl+Shift+Alt+V": pasteAndGoInNewTab,
		"Ctrl+E": toggleExtensionToolbarButtons,
		"Alt+H": hibernateBackgroundTabs,
		"Alt+Z": () => openHistoryMenu("back"),
		"Alt+X": () => openHistoryMenu("forward")
	};

	function copyCurrentPageUrl() {
		const oldFocus = document.activeElement;
		const addressField = document.querySelector("input.url.vivaldi-addressfield");
		addressField.select();
		document.execCommand("copy");

		if(oldFocus) {
			oldFocus.focus();
		} else {
			addressField.blur();
		}
	}

	function pasteAndGoInNewTab() {
		const oldFocus = document.activeElement;

		if(oldFocus){
			oldFocus.blur();
		}

		// Very clever, thanks to https://github.com/justdanpo/VivaldiHooks/blob/master/vivaldi/hooks/newtab-middleclick-pasteandgo.js
		function onPaste(event){
			event.preventDefault();

			const clipboardData = event.clipboardData.getData("text/plain");
			if(clipboardData.length){
				chrome.tabs.create({ url: clipboardData });
			}

			document.removeEventListener("paste", onPaste);

			if(oldFocus) {
				oldFocus.focus();
			}
		}

		document.addEventListener("paste", onPaste);
		document.execCommand("paste");
	}

	/**
	 * Toggle whether extension overflow button toggles all extensions, or only the hidden extensions.
	 * Yes, it's a toggle for a toggle.
	 * With the custom CSS file (https://gist.github.com/Aldaviva/9fbe321331b7f80786a371e0fd4bcfaf#file-style-custom-css) installed,
	 * this will completely show and hide extensions with a keyboard shortcut, without leaving behind the toggle button or any other extension UI when they are all hidden.
	 */
	function toggleExtensionToolbarButtons(){
		const prefs = vivaldi.prefs;
		const showHiddenToggle = "vivaldi.address_bar.extensions.show_hidden_toggle";
		const showAllToggle = "vivaldi.address_bar.extensions.show_all_toggle";

		prefs.get(showHiddenToggle, oldShowHiddenToggleValue => {
			prefs.set({ path: showHiddenToggle, value: !oldShowHiddenToggleValue });
			prefs.set({ path: showAllToggle, value: oldShowHiddenToggleValue });
		});
	}

	/**
	 * Hibernate background tabs in the current window.
	 * Note that, by default, Alt+H will open the Vivaldi Help menu.
	 * You can disable this by disabling the "Alt Key for Main Menu" setting in Settings → Keyboard → Keyboard Shortcuts.
	 * This will also prevent you from opening the Vivaldi menu using by pressing the Alt key.
	 * You can still open the Vivaldi menu by pressing F10, or add a new key binding to Focus Main Menu in Settings → Keyboard → View.
	 * Alternatively, you can rebind the shortcut below to a different key sequence, like Ctrl+Shift+H.
	 */
	function hibernateBackgroundTabs() {
		chrome.tabs.query({ currentWindow: true }, tabsInCurrentWindow => {
			const discardableTabs = tabsInCurrentWindow.filter(tab => !tab.active && !tab.discarded && !tab.pinned);
			discardableTabs.forEach(tab => chrome.tabs.discard(tab.id));
		});
	}

	function openHistoryMenu(direction) {
		let navigationButtonTitle;
		switch(direction){
			case "back":
				navigationButtonTitle = "Go to previous page";
				break;
			case "forward":
				navigationButtonTitle = "Go to next page";
				break;
		}

		/* Find the button's child span element instead of the button itself because Vivaldi
		 * inconsistently attaches the title attribute to the button or its parent div depending
		 * on the history state. This way, we can always find the button by accessing the span's 
		 * parent.
		 */
		const navigationButtonSpanEl = document.querySelector(".UrlBar .toolbar-droptarget [title ^= '" + navigationButtonTitle + "'] span");

		if(navigationButtonSpanEl){
			const rightClickEvent = new MouseEvent("contextmenu", {
				bubbles: true,
				clientX: window.innerWidth/2,
				clientY: window.innerHeight/2
			});

			navigationButtonSpanEl.parentElement.dispatchEvent(rightClickEvent);
		} else {
			console.error("Could not find the "+direction+" button in the navigation toolbar. This can happen if you removed it using Customize › Remove From Toolbar. In this case, you can restore it using Customize › Reset Toolbar To Default, and the button will still be hidden by custom.css.");
		}
	}

	vivaldi.tabsPrivate.onKeyboardShortcut.addListener((_, shortcut) => {
		const shortcutHandler = SHORTCUT_HANDLERS[shortcut];
		if(shortcutHandler){
			// Only run the command if this window is the most recently focused window. Otherwise, you can see the history menu for the wrong window, or copy the wrong URL.
			const chromeCurrentWindowIdPromise = new Promise(resolve => chrome.windows.getCurrent(currentWindow => resolve(currentWindow.id)));
			const vivaldiCurrentWindowIdPromise = new Promise(resolve => vivaldi.windowPrivate.getCurrentId(resolve));

			Promise.all([chromeCurrentWindowIdPromise, vivaldiCurrentWindowIdPromise])
				.then(([chromeCurrentWindowId, vivaldiCurrentWindowId]) => {
					if(chromeCurrentWindowId === vivaldiCurrentWindowId){
						shortcutHandler();
					}
				});

			return false;
		}
	});
})();

/**
 * Inform WebAutoType extension (https://github.com/Aldaviva/WebAutoTypeVivaldiExtension) when a Vivaldi window is activated, so that it can send the active URL to KeePass.
 * Otherwise, switching foreground windows will not update the active URL.
 * This fixes the annoyance where you launch KeePass after navigating to a login page and it doesn't get the active URL.
 */
(function(){
	const webAutoTypeExtensionId = "bpikannkbkpbglmojcajbepbemdlpdhc";
	const message = { windowActivated: true };

	vivaldi.windowPrivate.onActivated.addListener((windowId, isWindowActive) => {
		if(isWindowActive){
			chrome.runtime.sendMessage(webAutoTypeExtensionId, message);
		}
	});
})();