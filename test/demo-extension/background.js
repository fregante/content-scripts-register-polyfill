import contentScriptsRegister from '../../ponyfill';

console.log('Background loaded');

if (globalThis.browser?.contentScripts.register) {
	console.log('Using native implementation');
} else {
	console.log('Using polyfill');
}

(globalThis.browser?.contentScripts.register ?? contentScriptsRegister)({
	allFrames: true,
	matches: ['https://ephiframe.vercel.app/*'],
	js: [
		{file: 'dynamic.js'},
		{code: 'document.body.insertAdjacentHTML(\'beforeEnd\', \'<p class="dynamic-code">This should be second</p>\');'},
	],
	css: [{file: 'dynamic.css'}],
});

(globalThis.browser?.contentScripts.register ?? contentScriptsRegister)({
	allFrames: true,
	matches: ['https://alt-ephiframe.vercel.app/*'],
	excludeMatches: ['https://alt-ephiframe.vercel.app/Parent-page*'],
	js: [
		{file: 'dynamic.js'},
		{code: 'document.body.insertAdjacentHTML(\'beforeEnd\', \'<p class="dynamic-code">This should be second</p>\');'},
	],
	css: [{file: 'dynamic.css'}],
});

console.log('Script registered');
