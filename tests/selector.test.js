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

	store.update( () => ({startTime:10000, endTime:20000}));
	
	expect(s.selectElapsedTimeInSecs()).toBe(10);
	
});

test("Test selectTotalNoncesPerMin selector", () => {

	// writes 100 nonces in 10 secs -> 600 nonces per minute
	store.update( () => ({totalNonces: 100, startTime:10000, endTime:20000}));
	
	expect(s.selectTotalNoncesPerMin()).toBe(600);
	
});


