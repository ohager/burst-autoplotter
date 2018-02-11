const extract = require("./extract");

// [85%] Generating nonces from 888635 to 930229  - output for AVX exec (blame Blago for that)
const NoncesChunkedRangeRegex = /Generating nonces from (\d+) to (\d+)/;
// CPU: 85% done, (9011 nonces/min) - output for AVX2 exec (blame Blago for that)
const CurrentChunkPercentageRegex = /CPU: (\d+)% done, \((\d+) nonces\/min\)/g;

const getNoncesChunkedRange = input => extract(NoncesChunkedRangeRegex, input);
const getCurrentChunkPercentage = input => extract(CurrentChunkPercentageRegex, input);
const getNoncesPerMinForAVX = (context,input) => {
	let groups = extract(CurrentChunkPercentageRegex, input);
	if(!groups) return null;
	
	// currently, the avx2 plotter has a percent based output, which differs from others instruction set output
	// so, it's necessary to calculate done nonces based on percentage
	const done = groups.$1;
	groups.$1 = Math.min(context.currentPlotNonces, Math.floor(context.currentPlotNonces * (done / 100.0)));
	return groups;
};

module.exports = {
	getCurrentChunkPercentage,
	getNoncesChunkedRange,
	getNoncesPerMinForAVX,
};

