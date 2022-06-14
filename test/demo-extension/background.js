import 'content-scripts-register-polyfill';

console.log('Background loaded');

if (chrome.contentScripts.register.toString().includes('[native code]')) {
	console.log('Using native implementation');
} else {
	console.log('Using polyfill');
}

chrome.contentScripts.register({
	allFrames: true,
	matches: ['https://iframe-test-page.vercel.app/*'],
	js: [
		{file: 'dynamic.js'},
		{code: 'document.body.insertAdjacentHTML(\'beforeEnd\', \'<p class="dynamic-code">This should be second</p>\');'},
	],
	css: [{file: 'dynamic.css'}],
});

chrome.contentScripts.register({
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
