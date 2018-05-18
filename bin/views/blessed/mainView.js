const $ = require('../../selectors');
const store = require('../../store');
const Scene = require("./scene");
const HeaderView = require("./headerView");
const TotalView = require("./totalView");
const PerPlotView = require("./perPlotView");
const FinalView = require("./finalView");
const ScoopsView = require("./scoopsView");
const MovePlotView = require("./movePlotView");

let listener = null;
let scene = null;

function start(onExit) {

	scene = new Scene();
	scene.addView("header", HeaderView);
	scene.addView("total", TotalView);
	scene.addView("perPlot", PerPlotView);
	scene.addView("scoopsView", ScoopsView);

	if ($.selectIsMovePlotEnabled()) {
		scene.addView("movePlot", MovePlotView);
	}

	scene.addView("final", FinalView);
	scene.onExit(({ reason }) => {
		stop();
		onExit(reason);
	});
	// for some reasons need to wrap render() in an arrow function, otherwise it doesn't work
	listener = store.listen(() => scene.render());
}

function stop() {
	store.unlisten(listener);
	scene.destroy();
}

module.exports = {
	run: start
};