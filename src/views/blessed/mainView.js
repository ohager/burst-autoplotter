const $ = require('../../selectors');
const store = require('../../store');
const Scene = require("./scene");
const HeaderView = require("./headerView");
const TotalView = require("./totalView");
const PerPlotView = require("./perPlotView");

let listener = null;
let scene = null;

function start() {

	/*
	const line = headerView.render({
		line: 0,
		instructionSet: $.selectInstructionSet(),
		threads: $.selectUsedThreads(),
		memoryInMiB: $.selectUsedMemory(),
		totalPlotSizeInGiB: $.selectTotalPlotSizeInGiB(),
		plotCount : $.selectPlotCount(),
		totalNonces : $.selectTotalNonces(),
	});
	*/
	
	scene = new Scene();
	scene.addView("header", HeaderView);
	scene.addView("total", TotalView);
	scene.addView("perPlot", PerPlotView);
	
	// for some reasons need to wrap render() in an arrow function, otherwise it doesn't work
	listener = store.listen( () => scene.render() );
	
}

function stop() {
	store.unlisten(listener);
	
	if ($.selectHasError()) return; // error is shown on catched rejection
	
	//scene.destroy();
	
	
	/*
	finalView.render({
		outputPath: $.selectOutputPath(),
		totalWrittenNonces: $.selectTotalWrittenNonces(),
		totalPlots: $.selectPlotCount(),
		noncesPerMinute: $.selectEffectiveNoncesPerSeconds() * 60,
		elapsedTimeSecs: $.selectElapsedTimeInSecs(),
		validatedPlots : $.selectValidatedPlots(),
	});
	*/
}


function render() {

	/*
	const error = $.selectError();

	if (error.length > 0) {
		errorView.render({
			line,
			error
		});
		return;
	}
	line = totalView.render({
		line,
		started: $.selectStartTime(),
		elapsed: $.selectElapsedTimeInSecs(),
		remaining: totalEstimatedDurationInSecs,
		eta: etaTotal,
		totalNonces: $.selectTotalNonces(),
		totalWrittenNonces: $.selectTotalWrittenNonces(),
		noncesPerMinute: $.selectEffectiveNoncesPerSeconds() * 60
	});
	
	if ($.selectPlotCount() > 1) {
		const plotEstimatedDurationInSecs = $.selectCurrentPlotEstimatedDurationInSecs();
		const etaPlot = plotEstimatedDurationInSecs  ? addSeconds(Date.now(), plotEstimatedDurationInSecs) : null;
		line = plotView.render({
			line: line + 2,
			plotIndex: $.selectCurrentPlotIndex(),
			plotCount: $.selectPlotCount(),
			remaining: plotEstimatedDurationInSecs,
			eta: etaPlot,
			nonces: $.selectCurrentPlotNonces(),
			writtenNonces: $.selectCurrentPlotWrittenNonces()
		});
	}
	
	scoopView.render({
		line: line + 2,
		percentage: $.selectScoopPercentage(),
	});
	*/
}

module.exports = {
	start,
	stop
};

