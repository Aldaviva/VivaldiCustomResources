/*
 * This function adds custom keyboard shortcuts.
 *  -  Ctrl+Shift+C: Copy current page location to clipboard
 *     There are Chromium extensions that do this, but Vivaldi's extension keyboard shortcut handling is not working properly in 2.3.
 *  -  Ctrl+E: Toggle the address bar Extension Visibility preference between "Toggle Only Hidden Extensions" and "Toggle All Extensions"
 *  -  Alt+H: Hibernate background tabs
 *
 * Keyboard Machine source: https://forum.vivaldi.net/topic/33122/custom-keyboard-shortcuts-mod
 */

/**
 * Keyboard Machine, a Mod for Vivaldi
 * Make custom shortcuts that do stuff™ and use them in the vivaldi UI
 * Based on "button machine". NO COPYRIGHT RESERVED. lonm.vivaldi.net
 * Version 1.0.0
 */

(function keyboardMachine(){
	/**
	* Add custom commands here
	* key: String of what keys to press - written in the form "Ctrl+Shift+Alt+Key"
	* value: A function describing what to do when the key is pressed
	*/
	const SHORTCUTS = {
		/**
		 * Copy current page URL to clipboard
		 */
		"Ctrl+Shift+C": () => {
			const oldFocus = document.activeElement;
			const addressField = document.querySelector("input.url.vivaldi-addressfield");
			addressField.select();
			document.execCommand("copy");
			if(oldFocus) {
				oldFocus.focus();
			} else {
				addressField.blur();
			}
		},

		/**
		 * Toggle whether extension overflow button toggles all extensions, or only the hidden extensions.
		 * Yes, it's a toggle for a toggle.
		 * With the custom CSS file (https://gist.github.com/Aldaviva/9fbe321331b7f80786a371e0fd4bcfaf#file-style-custom-css) installed,
		 * this will completely show and hide extensions with a keyboard shortcut, without leaving behind the toggle button or any other extension UI when they are all hidden.
		 */
		"Ctrl+E": () => {
			const prefs = vivaldi.prefs;
			const showHiddenToggle = "vivaldi.address_bar.extensions.show_hidden_toggle";
			const showAllToggle = "vivaldi.address_bar.extensions.show_all_toggle";

			prefs.get(showHiddenToggle, oldShowHiddenToggleValue => {
				prefs.set({ path: showHiddenToggle, value: !oldShowHiddenToggleValue });
				prefs.set({ path: showAllToggle, value: oldShowHiddenToggleValue });
			});
		},

		/**
		 * Hibernate background tabs in the current window.
		 * Note that, by default, Alt+H will open the Vivaldi Help menu.
		 * You can disable this by disabling the "Alt Key for Main Menu" setting in Settings → Keyboard → Keyboard Shortcuts.
		 * This will also prevent you from opening the Vivaldi menu using by pressing the Alt key.
		 * You can still open the Vivaldi menu by pressing F10, or add a new key binding to Focus Main Menu in Settings → Keyboard → View.
		 * Alternatively, you can rebind the shortcut below to a different key sequence, like Ctrl+Shift+H.
		 */
		"Alt+H": () => {
			chrome.windows.getCurrent(currentWindow => {
				chrome.tabs.getAllInWindow(currentWindow.id, tabsInCurrentWindow => {
					const discardableTabs = tabsInCurrentWindow.filter(tab => !tab.active && !tab.discarded);
					discardableTabs.forEach(tab => chrome.tabs.discard(tab.id));
				});
			});
		}
	};

	/**
	 * Handle a potential keyboard shortcut
	 * @param {String} combination written in the form (Ctrl+Shift+Alt+KEY)
	 * @param {boolean} extras I don't know what this does, but it's an extra argument whose value seems to be `false`
	 */
	function keyCombo(combination, extras){
		const customShortcut = SHORTCUTS[combination];
		if(customShortcut){
			customShortcut();
			return false;
		}
	}

	/**
	 * Check that the browser is loaded up properly, and init the mod
	 */
	function initMod(){
		if(document.querySelector("#browser")){
			vivaldi.tabsPrivate.onKeyboardShortcut.addListener(keyCombo);
		} else {
			setTimeout(initMod, 200);
		}
	}
	initMod();
})();

(function(){
	var mostRecentUrlSent = null;
	var urlLastSentAt = null;

	function updateActiveUrl() {
		chrome.windows.getCurrent(currentWindow => {
			chrome.tabs.getAllInWindow(currentWindow.id, tabsInCurrentWindow => {
				const activeTab = tabsInCurrentWindow.find(tab => tab.active);
				const activeTabUrl = activeTab.url;
				const now = new Date();

				if(activeTabUrl !== "" && (activeTabUrl !== mostRecentUrlSent || mostRecentUrlSent === null || now - urlLastSentAt >= 500)) {
					mostRecentUrlSent = activeTabUrl;
					urlLastSentAt = now;
					sendCurrentUrlUsingXhr(activeTabUrl);
				}
			});
		});
	}

	function sendCurrentUrlUsingXhr(currentUrl){
		var request = new XMLHttpRequest();

		var requestBody = new URLSearchParams();
		requestBody.set("activeUrl", currentUrl);

		request.open("POST", "http://127.0.0.1:53372/webautotype/activeurl/vivaldi");
		request.send(requestBody);
	}

	function init(){
		['onCreated', 'onRemoved', 'onFocusChanged'].forEach(windowEventName => {
			chrome.windows[windowEventName].addListener(updateActiveUrl);
		});

		['onCreated', 'onUpdated', 'onActivated', 'onDetached', 'onAttached', 'onRemoved', 'onReplaced'].forEach(tabEventName => {
			chrome.tabs[tabEventName].addListener(updateActiveUrl);
		});

		var lastFocusedWindowId = null;
		setInterval(function(){
			chrome.windows.getAll(windows => {
				const focusedWindow = windows.find(window => window.focused);
				if(!focusedWindow){
					lastFocusedWindowId = null;
				} else if(lastFocusedWindowId !== focusedWindow.id){
					lastFocusedWindowId = focusedWindow.id;
					updateActiveUrl();
				}
			});
		}, 500);
	}

	init();

	
})();

/**
 * Fix 1px resizing bug when Application Desktop Toolbars are shown or hidden.
 * For example, when showing or hiding the Winamp docked toolbar, Vivaldi windows will always reduce their own width and height by 1px
 * each, even if no resizing was required to avoid overlapping. The top-left corner doesn't move, so the right and bottom edges both shrink.
 * This function watches for this bug occurring and restores the previous desired window size.
 */
(function(){
	var originalSize = { width: -1, height: -1 };

	function getCurrentWindowSize(){
		return { width: window.outerWidth, height: window.outerHeight };
	}

	function updateCurrentWindowSize(){
		originalSize = getCurrentWindowSize();
	}

	window.addEventListener("resize", event => {
		const newSize = getCurrentWindowSize();
		console.debug("Browser window resized from "+originalSize.width+"×"+originalSize.height+"px to "+newSize.width+"×"+newSize.height+"px.");
		if(newSize.width < originalSize.width && newSize.width >= originalSize.width - 2 
			&& newSize.height < originalSize.height && newSize.height >= originalSize.height - 2 
			&& originalSize.width - newSize.width === originalSize.height - newSize.height){
			console.info("Resizing browser window to "+originalSize.width+"×"+originalSize.height+"px.");
			chrome.windows.update(chrome.windows.WINDOW_ID_CURRENT, originalSize);
		} else {
			updateCurrentWindowSize();
		}
	});

	updateCurrentWindowSize();
})();
