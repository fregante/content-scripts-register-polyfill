/* eslint-disable unicorn/prefer-module */
const path = require('path');

module.exports = {
	launch: {
		headless: false,
		args: [
			'--no-sandbox',
			'--disable-extensions-except=' + path.resolve(__dirname, 'test/dist'),
			'--window-size=400,800'
		]
	}
};
