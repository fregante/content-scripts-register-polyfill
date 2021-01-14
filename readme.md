# content-scripts-register-polyfill [![][badge-gzip]][link-bundlephobia]

[badge-gzip]: https://img.shields.io/bundlephobia/minzip/content-scripts-register-polyfill.svg?label=gzipped
[link-bundlephobia]: https://bundlephobia.com/result?p=content-scripts-register-polyfill

> WebExtensions: Polyfill for [browser.contentScripts.register()](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/contentScripts/register) for Chrome.

## Install

You can just download the [standalone bundle](https://packd.fregante.now.sh/content-scripts-register-polyfill) (it might take a minute to download) and include the file in your `manifest.json`, or:

```sh
npm install content-scripts-register-polyfill
```

```js
import 'content-scripts-register-polyfill';
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

- [webext-options-sync](https://github.com/fregante/webext-options-sync) - Helps you manage and autosave your extension's options.
- [webext-domain-permission-toggle](https://github.com/fregante/webext-domain-permission-toggle) - Browser-action context menu to request permission for the current tab.
- [webext-dynamic-content-scripts](https://github.com/fregante/webext-dynamic-content-scripts) - Automatically inject your `content_scripts` on custom domains.
- [webext-detect-page](https://github.com/fregante/webext-detect-page) - Detects where the current browser extension code is being run.
- [webext-content-script-ping](https://github.com/fregante/webext-content-script-ping) - One-file interface to detect whether your content script have loaded.
- [`Awesome WebExtensions`](https://github.com/fregante/Awesome-WebExtensions): A curated list of awesome resources for Web Extensions development.

## License

MIT © [Federico Brigante](https://bfred.it)
