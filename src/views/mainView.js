const store = require('../store');
const $ = require('../selectors');
const totalView = require("./totalView");
const plotView = require("./plotView");
const scoopView = require("./scoopView");
const {addSeconds} = require("date-fns");
/*
New View Design

0 OVERALL
1 Elapsed Time: 00:12:34  - Started: 01-03-2-18 16:02:12
2 Remaining Time: 01:23:45 - ETA: 01-03-2018 17:45:10
3 [###########                                      ] 10000/50000 - 20%
4
5 PLOT 1/5 Remaining Time: 00:12:34 - ETA: 01-03-2018 16:23:10
6 [*****************************                    ] 5000/10000 - 50%
7
8 SCOOPS
9 [...........................................      ] 85%
10
...
 */


let listener = null;
let interval = null;

function start() {
	console.clear();
	listener = store.listen(render); // immediate update on state changes
	interval = setInterval(render, 250); // steady update
}

function stop() {
	if (listener) store.unlisten(listener);
	if (interval) clearInterval(interval);
}

function render() {
	
	const state = store.get(); // use selectors instead
	
	let line = totalView.render({
		line: 0,
		started: state.startTime,
		elapsed: $.selectElapsedTimeInSecs(),
		remaining: $.selectTotalEstimatedDurationInSecs(),
		eta: addSeconds(Date.now(), $.selectTotalEstimatedDurationInSecs()),
		totalNonces: $.selectTotalNonces(),
		totalWrittenNonces: $.selectTotalWrittenNonces(),
		noncesPerMinute: $.selectEffectiveNoncesPerSeconds() * 60
	});
	
	//if($.selectPlotCount() >= 1)
	//{
	line = plotView.render({
		line: line + 2,
		plotIndex: $.selectCurrentPlotIndex(),
		plotCount: $.selectPlotCount(),
		remaining: $.selectCurrentPlotEstimatedDurationInSecs(),
		eta: addSeconds(Date.now(), $.selectCurrentPlotEstimatedDurationInSecs()),
		nonces: $.selectCurrentPlotNonces(),
		writtenNonces: $.selectCurrentPlotWrittenNonces()
	});
	//}

	line = scoopView.render({
		line: line + 2,
		percentage: $.selectScoopPercentage(),
		isScooping: $.selectIsWritingScoops(),
	});
	
	process.stdout.moveCursor(0,2);
}

module.exports = {
	start,
	stop
};

