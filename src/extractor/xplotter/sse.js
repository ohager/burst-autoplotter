const extract = require("../extract");

// CPU: 4428 nonces done, (9011 nonces/min) - SSE output
const NoncesPerMinRegex = /CPU: (\d+) nonces done, \((\d+) nonces\/min\)/g;

const tryGetNoncesPerMin = input => extract(NoncesPerMinRegex, input);

module.exports = {
	tryGetNoncesPerMin,
};

