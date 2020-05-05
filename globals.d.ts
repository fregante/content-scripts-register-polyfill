// eslint-disable-next-line no-undef
type ContentScriptsRegister = typeof browser.contentScripts.register;
declare namespace chrome.contentScripts {
	const register: (
		contentScriptOptions: browser.contentScripts.RegisteredContentScriptOptions,
		callback?: RegistrationCallback
	) => Promise<browser.contentScripts.RegisteredContentScript>;
}
