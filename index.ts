/// <reference path="./globals.d.ts" />

import chromeP from 'webext-polyfill-kinda';
import {patternToRegex} from 'webext-patterns';

async function isOriginPermitted(url: string): Promise<boolean> {
	return chromeP.permissions.contains({
		origins: [new URL(url).origin + '/*']
	});
}

async function wasPreviouslyLoaded(
	tabId: number,
	args: Record<string, any>
): Promise<boolean> {
	// Checks and sets a global variable
	const loadCheck = (key: string): boolean => {
		// @ts-expect-error "No index signature"
		const wasLoaded = document[key] as boolean;

		// @ts-expect-error "No index signature"
		document[key] = true;
		return wasLoaded;
	};

	// Safe code injection + argument passing
	const result = await chromeP.tabs.executeScript(tabId, {
		code: `(${loadCheck.toString()})(${JSON.stringify(args)})`
	});

	return result?.[0] as boolean;
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
			const matchesRegex = patternToRegex(...matches);

			const listener = async (
				tabId: number,
				{status}: chrome.tabs.TabChangeInfo,
				{url}: chrome.tabs.Tab
			): Promise<void> => {
				if (
					!status || // Only status updates are relevant
					!url || // No URL = no permission
					!matchesRegex.test(url) || // Manual `matches` glob matching
					!await isOriginPermitted(url) || // Without this, we might have temporary access via accessTab
					await wasPreviouslyLoaded(tabId, {js, css}) // Avoid double-injection
				) {
					return;
				}

				for (const file of css) {
					void chrome.tabs.insertCSS(tabId, {
						...file,
						matchAboutBlank,
						allFrames,
						runAt: runAt ?? 'document_start' // CSS should prefer `document_start` when unspecified
					});
				}

				for (const file of js) {
					void chrome.tabs.executeScript(tabId, {
						...file,
						matchAboutBlank,
						allFrames,
						runAt
					});
				}
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
