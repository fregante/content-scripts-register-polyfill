const path = require('path');

const extension = path.resolve(__dirname, 'test/dist');

module.exports = {
	launch: {
		headless: false,
		product: 'chrome',
		args: [
			`--disable-extensions-except=${extension}`,
			`--load-extension=s${extension}`,
			'--window-size=400,800'
		]
	},
	browserContext: 'default'
};
