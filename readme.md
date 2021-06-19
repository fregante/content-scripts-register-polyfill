# content-scripts-register-polyfill [![][badge-gzip]][link-bundlephobia]

[badge-gzip]: https://img.shields.io/bundlephobia/minzip/content-scripts-register-polyfill.svg?label=gzipped
[link-bundlephobia]: https://bundlephobia.com/result?p=content-scripts-register-polyfill

> WebExtensions: Polyfill for [browser.contentScripts.register()](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/contentScripts/register) for Chrome and Safari.

## Install

You can download the [standalone bundle](https://bundle.fregante.com/?pkg=content-scripts-register-polyfill) and include it in your `manifest.json`.

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

### Permissions

To use this polyfill, normally you don't need any permissions other than the permission to inject code on the specified hosts. Include it and use it.

However if you want to use `allFrames: true`, it's best to add the [`webNavigation` permission](https://developer.chrome.com/docs/extensions/reference/webNavigation/). Without it, `allFrames: true` will only work in limited situations:

- the iframe is on the same domain as the top frame
- the iframe is already on the page when `runAt` is configured to run (`runAt: 'start'` is unlikely to work)
- the iframe doesn't navigate to another or reload

## Related

- [webext-options-sync](https://github.com/fregante/webext-options-sync) - Helps you manage and autosave your extension's options.
- [webext-domain-permission-toggle](https://github.com/fregante/webext-domain-permission-toggle) - Browser-action context menu to request permission for the current tab.
- [webext-dynamic-content-scripts](https://github.com/fregante/webext-dynamic-content-scripts) - Automatically inject your `content_scripts` on custom domains.
- [webext-detect-page](https://github.com/fregante/webext-detect-page) - Detects where the current browser extension code is being run.
- [webext-content-script-ping](https://github.com/fregante/webext-content-script-ping) - One-file interface to detect whether your content script have loaded.
- [`Awesome WebExtensions`](https://github.com/fregante/Awesome-WebExtensions): A curated list of awesome resources for Web Extensions development.

## License

MIT © [Federico Brigante](https://fregante.com)
