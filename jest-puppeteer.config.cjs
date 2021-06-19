/* eslint-disable unicorn/prefer-module */
const path = require('path');

module.exports = {
	launch: {
		headless: false,
		executablePath: process.env.PUPPETEER_EXEC_PATH, // set by docker container
		args: [
			'--no-sandbox',
			'--disable-extensions-except=' + path.resolve(__dirname, 'test/dist'),
			'--window-size=400,800'
		]
	}
};
