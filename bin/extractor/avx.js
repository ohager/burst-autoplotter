const extract = require("./extract");

// [85%] Generating nonces from 888635 to 930229  - output for AVX exec (blame Blago for that)
const NoncesChunkedRangeRegex = /Generating nonces from (\d+) to (\d+)/;
// CPU: 85% done, (9011 nonces/min) - output for AVX2 exec (blame Blago for that)
const CurrentChunkPercentageRegex = /CPU: (\d+)% done, \((\d+) nonces\/min\)/g;

const tryGetNoncesChunkedRange = input => extract(NoncesChunkedRangeRegex, input);
const tryGetCurrentChunkPercentage = input => extract(CurrentChunkPercentageRegex, input);

module.exports = {
	tryGetCurrentChunkPercentage,
	tryGetNoncesChunkedRange
};