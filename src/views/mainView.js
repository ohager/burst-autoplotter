const store = require('../store');
const $ = require('../selectors');
const overall = require("./totalView");
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
function start () {
	console.clear();
	listener = store.listen( updateView ); // immediate update on state changes
	interval = setInterval( updateView , 1000); // steady update
}

function stop() {
	if(listener) store.unlisten(listener);
	if(interval) clearInterval(interval);
}

function updateView( ) {
	
	const state = store.get();
	
	overall.update({
		started: state.startTime,
		elapsed: $.selectElapsedTimeInSecs(),
		eta: Date.now(), // TODO: calculate some how ... or use selectors
		totalNonces: $.selectTotalNonces(),
		totalWrittenNonces : $.selectTotalWrittenNonces(),
	});
}

module.exports = {
	start,
	stop
};

