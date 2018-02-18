const $ = require('../selectors');
const store = require('../store');
const totalView = require("./totalView");
const plotView = require("./plotView");
const scoopView = require("./scoopView");
const headerView = require("./headerView");
const finalView = require("./finalView");
const errorView = require("./errorView");
const { addSeconds } = require("date-fns");

let listener = null;

function start() {
	console.clear();

	const line = headerView.render({
		line: 0,
		instructionSet: $.selectInstructionSet(),
		threads: $.selectUsedThreads(),
		memoryInMiB: $.selectUsedMemory(),
		totalPlotSizeInGiB: $.selectTotalPlotSizeInGiB(),
		plotCount: $.selectPlotCount(),
		totalNonces: $.selectTotalNonces()
	});

	listener = store.listen(render.bind(null, line));
}

function stop() {
	store.unlisten(listener);

	if ($.selectHasError()) return; // error is shown on catched rejection

	finalView.render({
		outputPath: $.selectOutputPath(),
		totalWrittenNonces: $.selectTotalWrittenNonces(),
		totalPlots: $.selectPlotCount(),
		noncesPerMinute: $.selectEffectiveNoncesPerSeconds() * 60,
		elapsedTimeSecs: $.selectElapsedTimeInSecs(),
		validatedPlots: $.selectValidatedPlots()
	});
}

function render(line) {

	const error = $.selectError();

	if (error.length > 0) {
		errorView.render({
			line,
			error
		});
		return;
	}

	const totalEstimatedDurationInSecs = $.selectTotalEstimatedDurationInSecs();
	const etaTotal = totalEstimatedDurationInSecs ? addSeconds(Date.now(), totalEstimatedDurationInSecs) : null;
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
		const etaPlot = plotEstimatedDurationInSecs ? addSeconds(Date.now(), plotEstimatedDurationInSecs) : null;
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
		percentage: $.selectScoopPercentage()
	});
}

module.exports = {
	start,
	stop
};