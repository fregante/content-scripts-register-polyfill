import contentScriptsRegister from '../../ponyfill';

console.log('Background loaded');

if (window.browser?.contentScripts.register) {
	console.log('Using native implementation');
} else {
	console.log('Using polyfill');
}

(window.browser?.contentScripts.register ?? contentScriptsRegister)({
	allFrames: true,
	matches: ['https://iframe-test-page.vercel.app/*'],
	js: [{file: 'dynamic.js'}],
	css: [{file: 'dynamic.css'}]
});

console.log('Script registered');
