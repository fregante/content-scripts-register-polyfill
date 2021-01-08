/// <reference path="./globals.d.ts" />

import {patternToRegex} from 'webext-patterns';

function webextensionPartialfill(apis: string[]): typeof window.browser {
	if (window.browser) {
		return window.browser;
	}

	const clone = {};
	for (const path of apis) {
		const segments = path.split('.');
		const [namespace] = segments;
		let localChrome = chrome; // Get from this
		let localBrowser = clone; // Set to this
		for (const segment of segments) {
			// @ts-expect-error
			localChrome = localChrome[segment];
			if (typeof localChrome === 'function') {
				// @ts-expect-error
				localBrowser[segment] = async (...arguments_: any[]) => new Promise((resolve, reject) => {
					// @ts-expect-error
					localChrome.call(chrome[namespace], ...arguments_, result => {
						if (chrome.runtime.lastError) {
							reject(chrome.runtime.lastError);
						} else {
							resolve(result);
						}
					});
				});
				break;
				// @ts-expect-error
			} else if (!localBrowser[segment]) {
				// @ts-expect-error
				localBrowser[segment] = {};
			}

			// @ts-expect-error
			localBrowser = localBrowser[segment];
		}
	}

	return clone as typeof window.browser;
}

const browser = webextensionPartialfill([
	'permissions.contains',
	'tabs.executeScript',
	'tabs.get',
	'tabs.insertCSS',
	'tabs.onUpdated.addListener',
	'tabs.onUpdated.removeListener'
]);

async function isOriginPermitted(url: string): Promise<boolean> {
	return browser.permissions.contains({
		origins: [new URL(url).origin + '/*']
	});
}

async function wasPreviouslyLoaded(tabId: number, loadCheck: string): Promise<boolean> {
	const result = await browser.tabs.executeScript(tabId, {
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

				const {url} = await browser.tabs.get(tabId);

				if (
					!url || // No URL = no permission;
					!matchesRegex.test(url) || // Manual `matches` glob matching
					!await isOriginPermitted(url) || // Permissions check
					await wasPreviouslyLoaded(tabId, loadCheck) // Double-injection avoidance
				) {
					return;
				}

				for (const file of css) {
					void browser.tabs.insertCSS(tabId, {
						...file,
						matchAboutBlank,
						allFrames,
						runAt: runAt ?? 'document_start' // CSS should prefer `document_start` when unspecified
					});
				}

				for (const file of js) {
					void browser.tabs.executeScript(tabId, {
						...file,
						matchAboutBlank,
						allFrames,
						runAt
					});
				}

				// Mark as loaded
				void browser.tabs.executeScript(tabId, {
					code: `${loadCheck} = true`,
					runAt: 'document_start',
					allFrames
				});
			};

			void browser.tabs.onUpdated.addListener(listener);
			const registeredContentScript = {
				async unregister() {
					return browser.tabs.onUpdated.removeListener(listener);
				}
			};

			if (typeof callback === 'function') {
				callback(registeredContentScript);
			}

			return Promise.resolve(registeredContentScript);
		}
	};
}
