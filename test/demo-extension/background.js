import '../../index.ts'; // `content-scripts-register-polyfill`

console.log('Background loaded');

/** @type {typeof browser} */
const {contentScripts} = window.browser ?? chrome;

contentScripts.register({
	allFrames: true,
	matches: ['https://iframe-test-page.vercel.app/*'],
	js: [{file: 'dynamic.js'}],
	css: [{file: 'dynamic.css'}]
});

console.log('Script registered');
