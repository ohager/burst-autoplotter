const store = require("../src/store");
const s = require('../src/selectors');

test("Test generic selector", () => {

	store.update( () => ({test:'test'}));
	
	const selectTest = s.select(state => state.test );
	
	expect(selectTest()).toBe('test');
	
});

test("Test isAVX selector", () => {

	store.update( () => ({instructionSet:'AVX'}));
	expect(s.selectIsAVX()).toBeTruthy();

	store.update( () => ({instructionSet:'AVX2'}));
	expect(s.selectIsAVX()).toBeTruthy();

	store.update( () => ({instructionSet:'SSE'}));
	expect(s.selectIsAVX()).toBeFalsy();

	store.update( () => ({instructionSet:undefined}));
	expect(s.selectIsAVX()).toBeFalsy();
	
});

test("Test cacheFile selector", () => {

	store.update( () => ({cacheFile:'.cache'}));
	expect(s.selectCacheFile()).toBe('.cache');
	
});

test("Test elapsedTime selector", () => {

	store.update( () => ({startTime:Date.now()-(10*1000)}));
	
	expect(s.selectElapsedTimeInSecs()).toBe(10);
	
});

test("Test selectEffectiveNoncesPerSeconds selector", () => {

	// writes 100 nonces in 10 secs -> 10 nonces per second
	store.update( () => ({totalWrittenNonces: 100, startTime:Date.now() - (10*1000)}));
	
	expect(s.selectEffectiveNoncesPerSeconds()).toBe(10);
	
});

test("Test selectTotalEstimatedDurationInSecs selector", () => {
	
	// writes 100 nonces in 10 secs -> 10 nonces per minute
	store.update( () => ({
		totalNonces: 1000,
		totalWrittenNonces: 100,
		startTime:Date.now() - (10*1000)})
	);
	// 900 remaining @10 nps
	expect(s.selectTotalEstimatedDurationInSecs()).toBe(90);
	
});


test("Test selectCurrentPlotEstimatedDurationInSecs selector", () => {

	// writes 500 nonces in 10 secs -> 10 nonces per minute
	store.update( () => ({
		totalWrittenNonces: 100,
		currentPlot: {
			nonces: 500,
			writtenNonces: 100
		}, startTime:Date.now() - (10*1000)}));
	// 400 remaining @10 nps
	expect(s.selectCurrentPlotEstimatedDurationInSecs()).toBe(40);
	
});


