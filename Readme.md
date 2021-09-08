VivaldiCustomResources
===

This repository is used as an online source of files for [Aldaviva/VivaldiCustomLauncher](https://github.com/Aldaviva/VivaldiCustomLauncher) to tweak the [Vivaldi](https://vivaldi.com) installation directory, which would otherwise be lost each time a Vivaldi update is installed. It allows me to publish changes to browser chrome resources, such as custom Javascript and Cascading Style Sheets, without forcing consumers to manually re-download VivaldiCustomLauncher each time.

These files go in `Application\*\resources\vivaldi\` in the Vivaldi installation directory and are added to `browser.html`. You could do this manually, but I recommend using [VivaldiCustomLauncher](https://github.com/Aldaviva/VivaldiCustomLauncher) to get these changes applied any time you launch Vivaldi, even after an upgrade.

## What's included?

### `custom.css`
Make the browser's chrome appearance more minimal, enable [maximum tab width](https://gist.github.com/Aldaviva/39e4472ab7a5ee50473de74df826d928), and fix one or two visual defects.

### `custom.js`
Add more keyboard shortcuts, and notify my password manager (using [Aldaviva/WebAutoTypeVivaldiExtension](https://github.com/Aldaviva/WebAutoTypeVivaldiExtension)) when the active window changes.