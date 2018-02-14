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

const selectTotalRemainingNonces = select(
	state => state.totalNonces - state.totalWrittenNonces
);

const selectElapsedTimeInSecs = select(
	state => Math.floor((Date.now() - state.startTime) / 1000)
);

const selectTotalNoncesPerMin = select(
	state => Math.floor(state.totalNonces / (selectElapsedTimeInSecs() / 60))
);

module.exports = {
	select,
	selectInstructionSet,
	selectIsAVX,
	selectCacheFile,
	selectElapsedTimeInSecs,
	selectTotalNoncesPerMin,
	selectTotalRemainingNonces,
	selectTotalWrittenNonces,
	selectTotalNonces,
};
