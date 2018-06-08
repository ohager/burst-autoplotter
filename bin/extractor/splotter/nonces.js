const extract = require("../extract");

// [CPU] N: 2048 (1138 nonces/min)
const NoncesPerMinRegex = /N: (\d+) \((\d+) nonces\/min\)/g;

const tryGetNoncesPerMin = input => extract(NoncesPerMinRegex, input);

module.exports = {
	tryGetNoncesPerMin
};