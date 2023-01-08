import {injectContentScript} from 'webext-content-scripts';
import chromeP from 'webext-polyfill-kinda';
import {patternToRegex} from 'webext-patterns';

// https://www.typescriptlang.org/docs/handbook/namespaces.html#aliases
import CS = browser.contentScripts;

const noMatchesError = 'Type error for parameter contentScriptOptions (Error processing matches: Array requires at least 1 items; you have 0) for contentScripts.register.';
const noPermissionError = 'Permission denied to register a content script for ';

const gotNavigation = typeof chrome === 'object' && 'webNavigation' in chrome;

async function isOriginPermitted(url: string): Promise<boolean> {
	return chromeP.permissions.contains({
		origins: [new URL(url).origin + '/*'],
	});
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
		matches = [],
		excludeMatches,
		runAt,
	} = contentScriptOptions;
	let {allFrames} = contentScriptOptions;
	if (gotNavigation) {
		allFrames = false;
	} else if (allFrames) {
		console.warn('`allFrames: true` requires the `webNavigation` permission to work correctly: https://github.com/fregante/content-scripts-register-polyfill#permissions');
	}

	if (matches.length === 0) {
		throw new Error(noMatchesError);
	}

	await Promise.all(
		matches.map(async pattern => {
			if (!await chromeP.permissions.contains({origins: [pattern]})) {
				throw new Error(noPermissionError + pattern);
			}
		}));

	const matchesRegex = patternToRegex(...matches);
	const excludeMatchesRegex = patternToRegex(...excludeMatches ?? []);

	const inject = async (url: string, tabId: number, frameId = 0) => {
		if (
			!matchesRegex.test(url) // Manual `matches` glob matching
			|| excludeMatchesRegex.test(url) // Manual `exclude_matches` glob matching
			|| !await isOriginPermitted(url) // Without this, we might have temporary access via accessTab
		) {
			return;
		}

		await injectContentScript({
			tabId,
			frameId,
		},
		{
			css,
			js,
			matchAboutBlank,
			runAt,
		}, {
			ignoreTargetErrors: true,
		});
	};

	const tabListener = async (
		tabId: number,
		{status}: chrome.tabs.TabChangeInfo,
		{url}: chrome.tabs.Tab,
	): Promise<void> => {
		// Only status updates are relevant
		// No URL = no permission
		if (status === 'loading' && url) {
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
