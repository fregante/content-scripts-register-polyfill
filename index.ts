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
	frameId: number | undefined,
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
		frameId,
		code: `(${loadCheck.toString()})(${JSON.stringify(args)})`
	});

	return result?.[0] as boolean;
}

if (typeof chrome === 'object' && !chrome.contentScripts) {
	const gotNavigation = 'webNavigation' in chrome;
	chrome.contentScripts = {
		// The callback is only used by webextension-polyfill
		async register(contentScriptOptions, callback) {
			const {
				js = [],
				css = [],
				matchAboutBlank,
				matches,
				runAt
			} = contentScriptOptions;
			let {allFrames} = contentScriptOptions;
			if (gotNavigation) {
				allFrames = false;
			} else if (allFrames) {
				console.warn('`allFrames: true` requires the `webNavigation` permission to work correctly: https://github.com/fregante/content-scripts-register-polyfill#permissions');
			}

			const matchesRegex = patternToRegex(...matches);

			const injectOnExistingTabs = async () => {
				const tabs = await chromeP.tabs.query({
					url: matches
				});

				for (const tab of tabs) {
					if (tab.id) {
						void injectIfNotPreviouslyLoaded(tab.id);
					}
				}
			};

			const injectIfPermanentlyPermitted = async (url: string, tabId: number, frameId?: number) => {
				if (
					!matchesRegex.test(url) || // Manual `matches` glob matching
					!await isOriginPermitted(url) // Without this, we might have temporary access via accessTab
				) {
					return;
				}

				await injectIfNotPreviouslyLoaded(tabId, frameId);
			};

			const injectIfNotPreviouslyLoaded = async (tabId: number, frameId?: number) => {
				if (await wasPreviouslyLoaded(tabId, frameId, {js, css})) {
					return;
				}

				for (const file of css) {
					void chrome.tabs.insertCSS(tabId, {
						...file,
						matchAboutBlank,
						allFrames,
						frameId,
						runAt: runAt ?? 'document_start' // CSS should prefer `document_start` when unspecified
					});
				}

				for (const file of js) {
					void chrome.tabs.executeScript(tabId, {
						...file,
						matchAboutBlank,
						allFrames,
						frameId,
						runAt
					});
				}
			};

			const tabListener = async (
				tabId: number,
				{status}: chrome.tabs.TabChangeInfo,
				{url}: chrome.tabs.Tab
			): Promise<void> => {
				// Only status updates are relevant
				// No URL = no permission
				if (status && url) {
					void injectIfPermanentlyPermitted(url, tabId);
				}
			};

			const navListener = async ({tabId, frameId, url}: chrome.webNavigation.WebNavigationTransitionCallbackDetails): Promise<void> => {
				void injectIfPermanentlyPermitted(url, tabId, frameId);
			};

			if (gotNavigation) {
				chrome.webNavigation.onCommitted.addListener(navListener);
			} else {
				chrome.tabs.onUpdated.addListener(tabListener);
			}

			const registeredContentScript = {
				async unregister() {
					if (gotNavigation) {
						chrome.webNavigation.onCommitted.removeListener(navListener);
					} else {
						chrome.tabs.onUpdated.removeListener(tabListener);
					}
				}
			};

			if (typeof callback === 'function') {
				callback(registeredContentScript);
			}

			void injectOnExistingTabs();

			return registeredContentScript;
		}
	};
}
