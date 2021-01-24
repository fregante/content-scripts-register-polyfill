/// <reference path="./globals.d.ts" />

import chromeP from 'webext-polyfill-kinda';
import {patternToRegex} from 'webext-patterns';

async function isOriginPermitted(url: string): Promise<boolean> {
	return chromeP.permissions.contains({
		origins: [new URL(url).origin + '/*']
	});
}

async function wasPreviouslyLoaded(tabId: number, loadCheck: string): Promise<boolean> {
	const result = await chromeP.tabs.executeScript(tabId, {
		code: loadCheck,
		runAt: 'document_start'
	});

	return result?.[0];
}

if (typeof chrome === 'object' && !chrome.contentScripts) {
	chrome.contentScripts = {
		// The callback is only used by webextension-polyfill
		async register(contentScriptOptions, callback) {
			const {
				js = [],
				css = [],
				allFrames,
				matchAboutBlank,
				matches,
				runAt
			} = contentScriptOptions;
			// Injectable code; it sets a `true` property on `document` with the hash of the files as key.
			const loadCheck = `document[${JSON.stringify(JSON.stringify({js, css}))}]`;

			const matchesRegex = patternToRegex(...matches);

			const listener = async (
				tabId: number,
				_: chrome.tabs.TabChangeInfo, // Not reliable at all. It might contain `url` or it might not
				{url}: chrome.tabs.Tab
			): Promise<void> => {
				if (
					!url || // No URL = no permission
					!matchesRegex.test(url) || // Manual `matches` glob matching
					!await isOriginPermitted(url) || // Without this, we might have temporary access via accessTab
					await wasPreviouslyLoaded(tabId, loadCheck) // Avoid double-injection
				) {
					return;
				}

				for (const file of css) {
					chrome.tabs.insertCSS(tabId, {
						...file,
						matchAboutBlank,
						allFrames,
						runAt: runAt ?? 'document_start' // CSS should prefer `document_start` when unspecified
					});
				}

				for (const file of js) {
					chrome.tabs.executeScript(tabId, {
						...file,
						matchAboutBlank,
						allFrames,
						runAt
					});
				}

				// Mark as loaded
				chrome.tabs.executeScript(tabId, {
					code: `${loadCheck} = true`,
					runAt: 'document_start',
					allFrames
				});
			};

			chrome.tabs.onUpdated.addListener(listener);
			const registeredContentScript = {
				async unregister() {
					// @ts-expect-error It complains about a (unused) mismatching property in Tab
					chromeP.tabs.onUpdated.removeListener(listener);
				}
			};

			if (typeof callback === 'function') {
				callback(registeredContentScript);
			}

			return Promise.resolve(registeredContentScript);
		}
	};
}
