const {normalizeProgress} = require("../utils");

function progressBar(min, max, current, length, sign = '#') {
	const progress = normalizeProgress(min, max, current, length);
	return `[${sign.repeat(progress)}${' '.repeat(length - progress)}]`;
}

module.exports = progressBar;
