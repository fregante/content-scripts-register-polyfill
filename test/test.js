/* globals page */

const {describe, beforeAll, it} = require( '@jest/globals');
const expect = require( 'expect-puppeteer');

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

	it('should load dynamic content script', async () => {
		await expect(page).toMatchElement('.dynamic');
	});

	it('should load static content script after a reload', async () => {
		await page.reload();
		await expect(page).toMatchElement('.static');
	});

	it('should load dynamic content script after a reload', async () => {
		await page.reload();
		await expect(page).toMatchElement('.dynamic');
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

	it('should load dynamic content script', async () => {
		await expect(iframe).toMatchElement('.dynamic');
	});

	it('should load static content script after a reload', async () => {
		await iframe.goto(iframe.url());
		await expect(iframe).toMatchElement('.static');
	});

	it.skip('should load dynamic content script after a reload', async () => {
		await iframe.goto(iframe.url());
		await expect(iframe).toMatchElement('.dynamic');
	});
});

// // Uncomment to hold the browser open a little longer
// // Also uncomment `launch.headless` in jest-puppeteer.config.js
// jest.setTimeout(10000000);
// describe('hold', () => {
// 	it('should wait forever', async () => {
// 		await new Promise(resolve => setTimeout(resolve, 10000))
// 	})
// });
