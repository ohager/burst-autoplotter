const { gib2b, asMultipleOf } = require('./utils');

const NONCE_SIZE_BYTES = 262144;

const asMultipleOfEight = number => asMultipleOf(number, 8);
const calculateNonces = bytes => asMultipleOfEight(bytes / NONCE_SIZE_BYTES);

function createPlotPartition(totalPlotSize, startNonce, chunks) {

	const totalNonces = calculateNonces(gib2b(totalPlotSize));
	const noncesPerChunk = asMultipleOfEight(Math.floor(totalNonces / chunks));
	let plots = [];
	let nonceSum = 0;
	for (let i = 0; i < chunks; ++i) {
		plots.push({
			startNonce: i > 0 ? plots[i - 1].startNonce + noncesPerChunk + 1 : +startNonce,
			nonces: i === chunks - 1 ? totalNonces - nonceSum : noncesPerChunk
		});
		nonceSum += plots[i].nonces;
	}

	return {
		totalNonces,
		plots
	};
}

module.exports = createPlotPartition;