const gigaBytes2Bytes = gib => gib * (1024 * 1024 * 1024);

const calculateNonces = bytes => Math.floor(bytes / 262144);


function _createPartition(totalPlotSize, startNonce, chunks) {
	
	const totalNonces = calculateNonces(gigaBytes2Bytes(totalPlotSize));
	const noncesPerChunk = Math.floor(totalNonces / chunks);
	let parts = [];
	let nonceSum = 0;
	let i = 0;
	// TODO: Refactor... DRY!
	for (; i < chunks - 1; ++i) {
		parts.push(
			{
				startNonce: i > 0 ? parts[i - 1].startNonce + noncesPerChunk : +startNonce,
				nonces: noncesPerChunk
			});
		nonceSum += noncesPerChunk;
	}
	parts.push({
		startNonce: i > 0 ? parts[i - 1].startNonce + noncesPerChunk : +startNonce,
		nonces: totalNonces - nonceSum
	});
	
	return {
		totalNonces: totalNonces,
		parts : parts
	};
}


module.exports = {
	create : _createPartition
};