const store = require('../store');
const extract = require('../extractor').extract;
const extractors = require('../extractor').extractors;
const $ = require("../selectors");

function handleDataAVX(text) {
	
	extract.on(text, extractors.avx.tryGetNoncesChunkedRange).do(groups => {
		store.update(state => (
			{
				currentPlot: {
					// state is immutable - need to create copies
					...state.currentPlot,
					avx: {
						...state.currentPlot.avx,
						chunkStart: +groups.$1,
						chunkEnd: +groups.$2
					}
				},
			}
		));
	});
	
	extract.on(text, extractors.avx.tryGetCurrentChunkPercentage).do(groups => {
		store.update(state => {
				const percentage = +groups.$1;
				const chunkSize = state.currentPlot.avx.chunkEnd - state.currentPlot.avx.chunkStart;
				const chunkWrittenNonces = Math.floor(chunkSize * (percentage / 100));
				const writtenNoncesDelta = chunkWrittenNonces > state.currentPlot.avx.chunkWrittenNonces ?
					chunkWrittenNonces - state.currentPlot.avx.chunkWrittenNonces : chunkWrittenNonces;
				
				return {
					totalWrittenNonces: state.totalWrittenNonces + writtenNoncesDelta,
					currentPlot: {
						// state is immutable - need to create copies
						...state.currentPlot,
						writtenNonces: state.currentPlot.writtenNonces + writtenNoncesDelta,
						avx: {
							...state.currentPlot.avx,
							chunkWrittenNonces: chunkWrittenNonces,
							chunkPercentage: percentage,
						}
					},
				}
			}
		);
	});
}

function handleDataSSE(text) {
	
	extract.on(text, extractors.sse.tryGetNoncesPerMin).do(groups => {
			const plotWrittenNonces = +groups.$1;
			store.update(state => (
				{
					totalWrittenNonces: state.totalWrittenNonces + plotWrittenNonces,
					currentPlot: {
						...state.currentPlot,
						writtenNonces: plotWrittenNonces,
					}
				})
			);
		}
	)
}


function handleData(output) {
	const text = output.toString();
	
	if ($.selectIsAVX()) {
		handleDataAVX(text);
	}
	else {
		handleDataSSE(text);
	}
	
}

module.exports = {
	handleData
};