const { gib2b } = require('./utils');

const NONCE_SIZE_BYTES = 262144;

const calculateNonces = bytes => Math.floor(bytes / NONCE_SIZE_BYTES);

function create(totalPlotSize, startNonce, chunks) {

	const totalNonces = calculateNonces(gib2b(totalPlotSize));
	const noncesPerChunk = Math.floor(totalNonces / chunks);
	let plots = [];
	let nonceSum = 0;
	for (let i = 0; i < chunks; ++i) {
		plots.push({
			startNonce: i > 0 ? plots[i - 1].startNonce + noncesPerChunk : +startNonce,
			nonces: i === chunks - 1 ? totalNonces - nonceSum : noncesPerChunk
		});
		nonceSum += noncesPerChunk;
	}

	return {
		totalNonces: totalNonces,
		plots: plots
	};
}

module.exports = {
	create
};