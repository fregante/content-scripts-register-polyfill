// https://www.typescriptlang.org/docs/handbook/namespaces.html#aliases
/* globals browser */
import CS = browser.contentScripts;

declare namespace chrome.contentScripts {
	const register = CS.register;
}
