/// <reference path="./globals.d.ts" />
import register from './ponyfill.js';

if (typeof chrome === 'object' && !chrome.contentScripts) {
	chrome.contentScripts = {register};
}
