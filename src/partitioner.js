const {gib2b} = require('./utils');

const NONCE_SIZE_BYTES = 262144;

const calculateNonces = bytes => Math.floor(bytes / NONCE_SIZE_BYTES);

function _createPartition(totalPlotSize, startNonce, chunks) {
	
	const totalNonces = calculateNonces(gib2b(totalPlotSize));
	const noncesPerChunk = Math.floor(totalNonces / chunks);
	let parts = [];
	let nonceSum = 0;
	for (let i = 0; i < chunks; ++i) {
		parts.push(
			{
				startNonce: i > 0 ? parts[i - 1].startNonce + noncesPerChunk : +startNonce,
				nonces: i === chunks.length - 1 ? totalNonces - nonceSum : noncesPerChunk
			});
		nonceSum += noncesPerChunk;
	}
	
	return {
		totalNonces: totalNonces,
		parts : parts
	};
}


module.exports = {
	create : _createPartition
};