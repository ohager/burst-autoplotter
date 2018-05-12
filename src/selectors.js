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

const selectOutputPath = select(
	state => state.outputPath
);

const selectUsedThreads = select(
	state => state.usedThreads
);

const selectUsedMemory = select(
	state => state.usedMemory
);

const selectAccount = select(
	state => state.account
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
	state => {
		const elapsed = selectElapsedTimeInSecs();
		return elapsed > 0 && state.totalWrittenNonces > 0 ? Math.floor(state.totalWrittenNonces / elapsed) : null;
	}
);

const selectTotalEstimatedDurationInSecs = select(
	state => {
		const npm = selectEffectiveNoncesPerSeconds();
		return npm ? Math.floor(selectTotalRemainingNonces() / npm) : null
	}
);

const selectCurrentPlotEstimatedDurationInSecs = select(
	state => {
		const npm = selectEffectiveNoncesPerSeconds();
		return npm ? Math.floor(selectCurrentPlotRemainingNonces() / npm) : null;
	}
);

const selectScoopPercentage = select(
	state => state.scoopPercentage || 0
);

const selectStartTime = select(
	state => state.startTime
);

const selectValidatedPlots = select(
	state => state.validatedPlots || []
);

const selectTotalPlotSizeInGiB = select(
	state => state.totalPlotSize
);

const selectError = select(
	state => state.error || ""
);

const selectHasError = select(
	state => selectError().length > 0
);

const selectHasFinished = select(
	state => selectHasError() || state.done
);


const selectTotalNonceRange = select(
	state => ({
		startNonce: state.totalStartNonce,
		endNonce: state.totalStartNonce + state.totalNonces
	})
);

const selectIsWritingScoops = select(
	state => selectScoopPercentage() > 0
);

const selectIsLogEnabled = select(
	state => state.logEnabled
);

const selectMessage = select(
	state => state.message || ""
);

const selectIsMovingPlot = select( state =>
	state.movePlot ? state.movePlot.isMoving : false
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
	selectScoopPercentage,
	selectIsWritingScoops,
	selectStartTime,
	selectValidatedPlots,
	selectOutputPath,
	selectUsedMemory,
	selectAccount,
	selectUsedThreads,
	selectTotalPlotSizeInGiB,
	selectHasError,
	selectError,
	selectHasFinished,
	selectTotalNonceRange,
	selectIsLogEnabled,
	selectMessage,
	selectIsMovingPlot,
};
