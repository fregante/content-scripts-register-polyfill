/* globals page */

import {describe, beforeAll, it} from '@jest/globals';
import expect from 'expect-puppeteer';

async function expectToNotMatchElement(window, selector) {
	try {
		await expect(window).toMatchElement(selector);
		throw new Error(`Expected ${selector} element found`);
	} catch (error) {
		if (!error.message.startsWith(`Element ${selector} not found`)) {
			throw error.message;
		}
	}
}

// TODO: Ensure that the elements are only injected once
// TODO: Test CSS injection

describe('tab', () => {
	beforeAll(async () => {
		await page.goto('https://iframe-test-page.vercel.app/');
	});

	it('should load page', async () => {
		await expect(page).toMatch('Parent page');
	});

	it('should load static content script', async () => {
		await expect(page).toMatchElement('.static');
	});

	it('should load file-based dynamic content script', async () => {
		await expect(page).toMatchElement('.dynamic');
	});

	it('should load code-based dynamic content script', async () => {
		await expect(page).toMatchElement('.dynamic-code');
	});

	it('should execute dynamic content scripts in the right order', async () => {
		await expect(page).toMatchElement('.dynamic + .dynamic-code');
	});

	it('should load static content script after a reload', async () => {
		await page.reload();
		await expect(page).toMatchElement('.static');
	});

	it('should load file-based dynamic content script after a reload', async () => {
		await page.reload();
		await expect(page).toMatchElement('.dynamic');
	});

	it('should load code-based dynamic content script after a reload', async () => {
		await page.reload();
		await expect(page).toMatchElement('.dynamic-code');
	});
});

let iframe;
describe('iframe', () => {
	beforeAll(async () => {
		await page.goto('https://iframe-test-page.vercel.app/');
		const elementHandle = await page.waitForSelector('iframe');
		iframe = await elementHandle.contentFrame();
	});
	it('should load iframe page', async () => {
		await expect(iframe).toMatch('Framed page');
	});

	it('should load static content script', async () => {
		await expect(iframe).toMatchElement('.static');
	});

	it('should load file-based dynamic content script', async () => {
		await expect(iframe).toMatchElement('.dynamic');
	});

	it('should load code-based dynamic content script', async () => {
		await expect(iframe).toMatchElement('.dynamic-code');
	});

	it('should execute dynamic content scripts in the right order', async () => {
		await expect(page).toMatchElement('.dynamic + .dynamic-code');
	});

	it('should load static content script after a reload', async () => {
		await iframe.goto(iframe.url());
		await expect(iframe).toMatchElement('.static');
	});

	it('should load file-based dynamic content script after a reload', async () => {
		await iframe.goto(iframe.url());
		await expect(iframe).toMatchElement('.dynamic');
	});

	it('should load code-based dynamic content script after a reload', async () => {
		await iframe.goto(iframe.url());
		await expect(iframe).toMatchElement('.dynamic-code');
	});
});

let iframeOfExcludedParent;
describe('excludeMatches', () => {
	beforeAll(async () => {
		await page.goto('https://fregante.github.io/pixiebrix-testing-ground/Parent-page?iframe=./Framed-page');
		const elementHandle = await page.waitForSelector('iframe');
		iframeOfExcludedParent = await elementHandle.contentFrame();
	});

	it('should load page and iframe', async () => {
		await expect(page).toMatchElement('title', {text: 'Parent page'});
		await expect(iframeOfExcludedParent).toMatchElement('title', {text: 'Framed page'});
	});

	it('should load static content script only in iframe', async () => {
		await expectToNotMatchElement(page, '.static');
		await expect(iframeOfExcludedParent).toMatchElement('.static');
	});

	it('should load file-based dynamic content script only in iframe', async () => {
		await expectToNotMatchElement(page, '.dynamic');
		await expect(iframeOfExcludedParent).toMatchElement('.dynamic');
	});

	it('should load code-based dynamic content script', async () => {
		await expectToNotMatchElement(page, '.dynamic-code');
		await expect(iframeOfExcludedParent).toMatchElement('.dynamic-code');
	});
});

// Uncomment to hold the browser open a little longer
// import {jest} from '@jest/globals';
// jest.setTimeout(10000000);
// describe('hold', () => {
// 	it('should wait forever', async () => {
// 		await new Promise(resolve => setTimeout(resolve, 1000000))
// 	})
// });
