var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

const store = require('../store');
const extract = require('../extractor').extract;
const extractors = require('../extractor').extractors;
const $ = require("../selectors");

function handleDataAVX(text) {

	extract.on(text, extractors.avx.tryGetNoncesChunkedRange).do(groups => {
		store.update(state => ({
			currentPlot: _extends({}, state.currentPlot, {
				avx: _extends({}, state.currentPlot.avx, {
					chunkStart: +groups.$1,
					chunkEnd: +groups.$2
				})
			})
		}));
	});

	extract.on(text, extractors.avx.tryGetCurrentChunkPercentage).do(groups => {
		store.update(state => {
			const percentage = +groups.$1;
			const chunkSize = state.currentPlot.avx.chunkEnd - state.currentPlot.avx.chunkStart;
			const chunkWrittenNonces = Math.floor(chunkSize * (percentage / 100));
			const writtenNoncesDelta = chunkWrittenNonces > state.currentPlot.avx.chunkWrittenNonces ? chunkWrittenNonces - state.currentPlot.avx.chunkWrittenNonces : chunkWrittenNonces;

			return {
				totalWrittenNonces: state.totalWrittenNonces + writtenNoncesDelta,
				currentPlot: _extends({}, state.currentPlot, {
					writtenNonces: state.currentPlot.writtenNonces + writtenNoncesDelta,
					avx: _extends({}, state.currentPlot.avx, {
						chunkWrittenNonces: chunkWrittenNonces,
						chunkPercentage: percentage
					})
				})
			};
		});
	});
}

function handleDataSSE(text) {

	extract.on(text, extractors.sse.tryGetNoncesPerMin).do(groups => {
		const plotWrittenNonces = +groups.$1;
		store.update(state => {
			const writtenNoncesDelta = plotWrittenNonces > state.currentPlot.writtenNonces ? plotWrittenNonces - state.currentPlot.writtenNonces : plotWrittenNonces;

			return {
				totalWrittenNonces: state.totalWrittenNonces + writtenNoncesDelta,
				currentPlot: _extends({}, state.currentPlot, {
					writtenNonces: plotWrittenNonces
				})
			};
		});
	});
}

function handleData(output) {
	const text = output.toString();

	if ($.selectIsAVX()) {
		handleDataAVX(text);
	} else {
		handleDataSSE(text);
	}

	extract.on(text, extractors.scoops.getWritingScoops).do(groups => {
		store.update(() => ({
			scoopPercentage: +groups.$1
		}));
	});
}

module.exports = handleData;