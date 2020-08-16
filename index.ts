/// <reference path="./globals.d.ts" />

import {patternToRegex} from 'webext-patterns';

// @ts-expect-error
async function p<T>(fn, ...args): Promise<T> {
	return new Promise((resolve, reject) => {
		// @ts-expect-error
		fn(...args, result => {
			if (chrome.runtime.lastError) {
				reject(chrome.runtime.lastError);
			} else {
				resolve(result);
			}
		});
	});
}

async function isOriginPermitted(url: string): Promise<boolean> {
	return p(chrome.permissions.contains, {
		origins: [new URL(url).origin + '/*']
	});
}

async function wasPreviouslyLoaded(tabId: number, loadCheck: string): Promise<boolean> {
	const result = await p<boolean[]>(chrome.tabs.executeScript, tabId, {
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

			const listener = async (tabId: number, {status}: chrome.tabs.TabChangeInfo): Promise<void> => {
				if (status !== 'loading') {
					return;
				}

				const {url} = await p(chrome.tabs.get, tabId);

				if (
					!url || // No URL = no permission;
					!matchesRegex.test(url) || // Manual `matches` glob matching
					!await isOriginPermitted(url) || // Permissions check
					await wasPreviouslyLoaded(tabId, loadCheck) // Double-injection avoidance
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
					return p(chrome.tabs.onUpdated.removeListener.bind(chrome.tabs.onUpdated), listener);
				}
			};

			if (typeof callback === 'function') {
				callback(registeredContentScript);
			}

			return Promise.resolve(registeredContentScript);
		}
	};
}
