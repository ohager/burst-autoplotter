const extract = require("./extract");

// file: 12345678901234567890_7299739_4096_4096    checked - OK
// file: 12345678901234567890_7299739_4096_4096    ERROR blabla
const ValidatorRegex = /file: (\d+_\d+_\d+_\d+).*(OK|ERROR)/;

const getValidationInfo = input => extract(ValidatorRegex, input);

module.exports = {
	getValidationInfo
};
