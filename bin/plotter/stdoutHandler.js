var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

const store = require('../store');
const extract = require('../extractor').extract;
const extractors = require('../extractor').extractors;
const $ = require("../selectors");

function handleDataSSE(text) {

	extract.on(text, extractors.nonces.tryGetNoncesPerMin).do(groups => {
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

	handleDataSSE(text);

	extract.on(text, extractors.scoops.getWritingScoops).do(groups => {
		store.update(() => ({
			scoopPercentage: +groups.$1
		}));
	});
}

module.exports = handleData;