# content-scripts-register-polyfill

> WebExtensions: Polyfill for [browser.contentScripts.register()](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/contentScripts/register) for Chrome.

[![Travis build status](https://api.travis-ci.com/bfred-it/content-scripts-register-polyfill.svg?branch=master)](https://travis-ci.com/bfred-it/content-scripts-register-polyfill)
[![npm version](https://img.shields.io/npm/v/content-scripts-register-polyfill.svg)](https://www.npmjs.com/package/content-scripts-register-polyfill)

## Install

You can just download the [standalone bundle](https://packd.bfred-it.now.sh/content-scripts-register-polyfill) (it might take a minute to download) and include the file in your `manifest.json`, or:

```sh
npm install content-scripts-register-polyfill
```

```js
import 'content-scripts-register-polyfill';
```

```js
require('content-scripts-register-polyfill');
```

## Usage

Include the script via `manifest.json`, then refer to the original [`contentScripts.register()`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/contentScripts/register) documentation.

```js
const registeredScript = await chrome.contentScripts.register({
	js: [{
		file: 'myfile.js'
	}],
	matches: [
		'https://google.com/*'
	]
});
```

Additionally, if you're using [webextension-polyfill](https://github.com/mozilla/webextension-polyfill), you can also use it with the original `browser.*` name: `browser.contentsScripts.register()`

```js
const registeredScript = await browser.contentScripts.register({
	js: [{
		file: 'myfile.js'
	}],
	matches: [
		'https://google.com/*'
	]
});
```

## Related

* [webext-options-sync](https://github.com/bfred-it/webext-options-sync) - Helps you manage and autosave your extension's options.
* [webext-domain-permission-toggle](https://github.com/bfred-it/webext-domain-permission-toggle) - Browser-action context menu to request permission for the current tab.
* [webext-dynamic-content-scripts](https://github.com/bfred-it/webext-dynamic-content-scripts) - Automatically inject your `content_scripts` on custom domains.
* [webext-detect-page](https://github.com/bfred-it/webext-detect-page) - Detects where the current browser extension code is being run.
* [webext-content-script-ping](https://github.com/bfred-it/webext-content-script-ping) - One-file interface to detect whether your content script have loaded.
* [`Awesome WebExtensions`](https://github.com/bfred-it/Awesome-WebExtensions): A curated list of awesome resources for Web Extensions development.

## License

MIT © Federico Brigante — [Twitter](http://twitter.com/bfred_it)
