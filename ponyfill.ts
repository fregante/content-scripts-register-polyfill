import {executeFunction} from 'webext-content-scripts';
import chromeP from 'webext-polyfill-kinda';
import {patternToRegex} from 'webext-patterns';

// https://www.typescriptlang.org/docs/handbook/namespaces.html#aliases
import CS = browser.contentScripts;

interface Target {
	tabId: number;
	frameId: number;
}

const gotScripting = typeof chrome === 'object' && 'scripting' in chrome;
const gotNavigation = typeof chrome === 'object' && 'webNavigation' in chrome;

async function isOriginPermitted(url: string): Promise<boolean> {
	return chromeP.permissions.contains({
		origins: [new URL(url).origin + '/*'],
	});
}

function arrayOrUndefined<X>(value?: X): [X] | undefined {
	return typeof value === 'undefined' ? undefined : [value];
}

async function wasPreviouslyLoaded(
	target: Target,
	arg: Record<string, any>,
): Promise<boolean> {
	// Checks and sets a global variable
	const loadCheck = (key: string): boolean => {
		// @ts-expect-error "No index signature"
		const wasLoaded = document[key] as boolean;

		// @ts-expect-error "No index signature"
		document[key] = true;
		return wasLoaded;
	};

	return executeFunction(target, loadCheck, arg);
}

// The callback is only used by webextension-polyfill
export default async function registerContentScript(
	contentScriptOptions: CS.RegisteredContentScriptOptions,
	callback?: (contentScript: CS.RegisteredContentScript) => void,
): Promise<CS.RegisteredContentScript> {
	const {
		js = [],
		css = [],
		matchAboutBlank,
		matches,
		excludeMatches,
		runAt,
	} = contentScriptOptions;
	let {allFrames} = contentScriptOptions;
	if (gotNavigation) {
		allFrames = false;
	} else if (allFrames) {
		console.warn('`allFrames: true` requires the `webNavigation` permission to work correctly: https://github.com/fregante/content-scripts-register-polyfill#permissions');
	}

	const matchesRegex = patternToRegex(...matches);
	const excludeMatchesRegex = patternToRegex(...excludeMatches ?? []);

	const inject = async (url: string, tabId: number, frameId: number = 0) => {
		if (
			!matchesRegex.test(url) // Manual `matches` glob matching
			|| excludeMatchesRegex.test(url) // Manual `exclude_matches` glob matching
			|| !await isOriginPermitted(url) // Without this, we might have temporary access via accessTab
			|| await wasPreviouslyLoaded({tabId, frameId}, {js, css}) // Avoid double-injection
		) {
			return;
		}

		for (const content of css) {
			if (gotScripting) {
				void chrome.scripting.insertCSS({
					target: {
						tabId,
						frameIds: arrayOrUndefined(frameId),
						allFrames,
					},
					files: 'file' in content ? [content.file] : undefined,
					css: 'code' in content ? content.code : undefined,
				});
			} else {
				void chromeP.tabs.insertCSS(tabId, {
					...content,
					matchAboutBlank,
					allFrames,
					frameId,
					runAt: runAt ?? 'document_start', // CSS should prefer `document_start` when unspecified
				});
			}
		}

		let lastInjection: Promise<unknown> | undefined;
		for (const content of js) {
			if (gotScripting) {
				if ('code' in content) {
					throw new Error('chrome.scripting does not support injecting strings of `code`');
				}

				void chrome.scripting.executeScript({
					target: {
						tabId,
						frameIds: arrayOrUndefined(frameId),
						allFrames,
					},
					files: [content.file],
				});
			} else {
				// Files are executed in order, but code isn’t, so it must wait the last script #31
				if ('code' in content) {
					// eslint-disable-next-line no-await-in-loop -- On purpose, to serialize injection
					await lastInjection;
				}

				lastInjection = chromeP.tabs.executeScript(tabId, {
					...content,
					matchAboutBlank,
					allFrames,
					frameId,
					runAt,
				});
			}
		}
	};

	const tabListener = async (
		tabId: number,
		{status}: chrome.tabs.TabChangeInfo,
		{url}: chrome.tabs.Tab,
	): Promise<void> => {
		// Only status updates are relevant
		// No URL = no permission
		if (status && url) {
			void inject(url, tabId);
		}
	};

	const navListener = async ({
		tabId,
		frameId,
		url,
	}: chrome.webNavigation.WebNavigationTransitionCallbackDetails): Promise<void> => {
		void inject(url, tabId, frameId);
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
		},
	};

	if (typeof callback === 'function') {
		callback(registeredContentScript);
	}

	return registeredContentScript;
}
