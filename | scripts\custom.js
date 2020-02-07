/*
 * This file adds custom keyboard shortcuts.
 *  -  Ctrl+Shift+C: Copy current page location to clipboard
 *     There are Chromium extensions that do this, but Vivaldi's extension keyboard shortcut handling is not working properly in 2.3.
 *  -  Ctrl+E: Toggle the address bar Extension Visibility preference between "Toggle Only Hidden Extensions" and "Toggle All Extensions"
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
    * key: String of what keys to press - written in the form (Ctrl+Shift+Alt+Key)
    * value: A function describing what to do when the key is pressed
    */
    const SHORTCUTS = {
        /**
         * Copy current page URL to clipboard on Ctrl+Shift+C
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
        }
    };

    /**
     * Handle a potential keyboard shortcut
     * @param {String} combination written in the form (Ctrl+Shift+Alt+KEY)
     * @param {boolean} extras I don't know what this does, but it's an extra argument
     */
    function keyCombo(combination, extras){
        const customShortcut = SHORTCUTS[combination];
        if(customShortcut){
            customShortcut();
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
