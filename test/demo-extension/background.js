import contentScriptsRegister from '../../ponyfill';

console.log('Background loaded');

if (globalThis.browser?.contentScripts.register) {
	console.log('Using native implementation');
} else {
	console.log('Using polyfill');
}

(globalThis.browser?.contentScripts.register ?? contentScriptsRegister)({
	allFrames: true,
	matches: ['https://iframe-test-page.vercel.app/*'],
	js: [
		{file: 'dynamic.js'},
		{code: 'document.body.insertAdjacentHTML(\'beforeEnd\', \'<p class="dynamic-code">This should be second</p>\');'},
	],
	css: [{file: 'dynamic.css'}],
});

(globalThis.browser?.contentScripts.register ?? contentScriptsRegister)({
	allFrames: true,
	matches: ['https://fregante.github.io/pixiebrix-testing-ground/*'],
	excludeMatches: ['https://fregante.github.io/pixiebrix-testing-ground/Parent-page*'],
	js: [
		{file: 'dynamic.js'},
		{code: 'document.body.insertAdjacentHTML(\'beforeEnd\', \'<p class="dynamic-code">This should be second</p>\');'},
	],
	css: [{file: 'dynamic.css'}],
});

console.log('Script registered');
