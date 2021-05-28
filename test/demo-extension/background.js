import '../..'; // `content-scripts-register-polyfill`

console.log('Background loaded');

chrome.contentScripts.register({
	matches: ['https://www.google.com/*'],
	js: [{file: 'dynamic.js'}],
	css: [{file: 'dynamic.css'}]
}).then(console.log, console.error);

console.log('Script registered');
