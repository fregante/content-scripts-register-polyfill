import '../../index.ts'; // `content-scripts-register-polyfill`

console.log('Background loaded');

(window.browser || chrome).contentScripts.register({
	matches: ['https://www.google.com/*'],
	js: [{file: 'dynamic.js'}],
	css: [{file: 'dynamic.css'}]
}).then(console.log, console.error);

(window.browser || chrome).contentScripts.register({
	matches: ['http://localhost/'],
	allFrames: true,
	js: [{file: 'dynamic.js'}],
	css: [{file: 'dynamic.css'}]
}).then(console.log, console.error);

console.log('Script registered');
