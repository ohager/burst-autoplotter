const store = require("./store");

/**
 * Generic selector function to access the stores state.
 * It allows to transform a state in arbitrary return values
 * @param fn Transformation function with stores state as parameter: (state) => { //... }
 * @returns {function(): *} A function that returns the transformed/selected state value
 */
const select = (fn) => () => fn(store.get());

const selectIsAVX = select(
	state =>
	state.instructionSet &&
	state.instructionSet.indexOf('AVX') !== -1
);

const selectInstructionSet = select(
	state => state.instructionSet
);

const selectTotalWrittenNonces = select(
	state => state.totalWrittenNonces
);

const selectTotalNonces = select(
	state => state.totalNonces
);

const selectCacheFile = select(
	state => state.cacheFile
);

const selectPlotCount = select(
	state => state.plotCount
);

const selectCurrentPlotIndex = select(
	state => state.currentPlot.index
);

const selectTotalRemainingNonces = select(
	state => state.totalNonces - state.totalWrittenNonces
);

const selectElapsedTimeInSecs = select(
	state => Math.floor((Date.now() - state.startTime) / 1000)
);

const selectCurrentPlotNonces = select(
	state => state.currentPlot.nonces
);

const selectCurrentPlotWrittenNonces = select(
	state => state.currentPlot.writtenNonces
);

const selectCurrentPlotRemainingNonces = select(
	state => state.currentPlot.nonces - state.currentPlot.writtenNonces
);

const selectEffectiveNoncesPerSeconds = select(
	state => Math.floor(state.totalWrittenNonces / selectElapsedTimeInSecs())
);

const selectTotalEstimatedDurationInSecs = select(
	state => Math.floor(selectTotalRemainingNonces() / selectEffectiveNoncesPerSeconds())
);

const selectCurrentPlotEstimatedDurationInSecs = select(
	state => Math.floor(selectCurrentPlotRemainingNonces() / selectEffectiveNoncesPerSeconds())
);

const selectScoopPercentage = select(
	state => state.scoopPercentage
);

const selectIsWritingScoops = select(
	state => state.isWritingScoops
);


module.exports = {
	select,
	selectInstructionSet,
	selectIsAVX,
	selectCacheFile,
	selectElapsedTimeInSecs,
	selectTotalRemainingNonces,
	selectTotalWrittenNonces,
	selectTotalNonces,
	selectPlotCount,
	selectCurrentPlotIndex,
	selectCurrentPlotWrittenNonces,
	selectCurrentPlotNonces,
	selectEffectiveNoncesPerSeconds,
	selectCurrentPlotEstimatedDurationInSecs,
	selectTotalEstimatedDurationInSecs,
	selectCurrentPlotRemainingNonces,
	selectIsWritingScoops,
	selectScoopPercentage
};
