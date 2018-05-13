const store = require("../src/store");
const $ = require('../src/selectors');

test("Test generic selector", () => {
	
	store.update(() => ({test: 'test'}));
	
	const selectTest = $.select(state => state.test);
	
	expect(selectTest()).toBe('test');
	
});

test("Test isAVX selector", () => {
	
	store.update(() => ({instructionSet: 'AVX'}));
	expect($.selectIsAVX()).toBeTruthy();
	
	store.update(() => ({instructionSet: 'AVX2'}));
	expect($.selectIsAVX()).toBeTruthy();
	
	store.update(() => ({instructionSet: 'SSE'}));
	expect($.selectIsAVX()).toBeFalsy();
	
	store.update(() => ({instructionSet: undefined}));
	expect($.selectIsAVX()).toBeFalsy();
	
});

test("Test cacheFile selector", () => {
	
	store.update(() => ({cacheFile: '.cache'}));
	expect($.selectCacheFile()).toBe('.cache');
	
});

test("Test elapsedTime selector", () => {
	
	store.update(() => ({startTime: Date.now() - (10 * 1000)}));
	
	expect($.selectElapsedTimeInSecs()).toBe(10);
	
});

test("Test selectEffectiveNoncesPerSeconds selector", () => {
	
	// writes 100 nonces in 10 secs -> 10 nonces per second
	store.update(() => ({totalWrittenNonces: 100, startTime: Date.now() - (10 * 1000)}));
	
	expect($.selectEffectiveNoncesPerSeconds()).toBe(10);
	
});

test("Test selectTotalEstimatedDurationInSecs selector", () => {
	
	// writes 100 nonces in 10 secs -> 10 nonces per minute
	store.update(() => ({
			totalNonces: 1000,
			totalWrittenNonces: 100,
			startTime: Date.now() - (10 * 1000)
		})
	);
	// 900 remaining @10 nps
	expect($.selectTotalEstimatedDurationInSecs()).toBe(90);
	
});


test("Test selectCurrentPlotEstimatedDurationInSecs selector", () => {
	
	// writes 500 nonces in 10 secs -> 10 nonces per minute
	store.update(() => ({
		totalWrittenNonces: 100,
		currentPlot: {
			nonces: 500,
			writtenNonces: 100
		}, startTime: Date.now() - (10 * 1000)
	}));
	// 400 remaining @10 nps
	expect($.selectCurrentPlotEstimatedDurationInSecs()).toBe(40);
	
});


test("Test selectTotalNonceRange selector", () => {
	
	// writes 500 nonces in 10 secs -> 10 nonces per minute
	store.update(() => ({
		totalStartNonce: 1000,
		totalNonces: 4000
	}));
	// 400 remaining @10 nps
	expect($.selectTotalNonceRange()).toEqual({
		startNonce: 1000,
		endNonce : 5000
	});
	
});

test("Test selectTotalNonceRange selector", () => {
	
	// writes 500 nonces in 10 secs -> 10 nonces per minute
	store.update(() => ({
		totalStartNonce: 1000,
		totalNonces: 4000
	}));
	// 400 remaining @10 nps
	expect($.selectTotalNonceRange()).toEqual({
		startNonce: 1000,
		endNonce : 5000
	});
	
});


test("Test selectIsWritingScoops selector", () => {
	
	store.update(() => ({
		scoopPercentage: 1.23
	}));
	expect($.selectIsWritingScoops()).toBeTruthy();
	
	store.update(() => ({
		scoopPercentage: 0.00
	}));
	expect($.selectIsWritingScoops()).toBeFalsy();
});

test("Test selectIsAVX selector", () => {
	
	store.update(() => ({
		instructionSet: ""
	}));
	expect($.selectIsAVX ()).toBeFalsy();
	
	store.update(() => ({
		instructionSet: "AVX"
	}));
	expect($.selectIsAVX ()).toBeTruthy();
});

test("Test selectHasError selector", () => {
	
	store.update(() => ({
		error: ""
	}));
	expect($.selectHasError()).toBeFalsy();
	
	store.update(() => ({
		error: "Test Error"
	}));
	expect($.selectHasError()).toBeTruthy();
});

test("Test selectMovePlotTransferSpeed selector", () => {
	
	store.update(() => ({
		movePlot:{
			startTime: Date.now(),
			copiedBytes: 1024 * 1024
		}
	}));
	expect($.selectMovePlotTransferSpeed()).toBe(null);
	
	store.update(() => ({
		movePlot:{
			startTime: Date.now() - 1000,
			copiedBytes: 1024 * 1024
		}
	}));
	expect($.selectMovePlotTransferSpeed()).toBe("1.00");
	
	store.update(() => ({
		movePlot:{
			startTime: Date.now() - 2000,
			copiedBytes: 10 * 1024 * 1024
		}
	}));
	expect($.selectMovePlotTransferSpeed()).toBe("5.00");
	
});

