const $ = require('../../selectors');
const store = require('../../store');
const Scene = require("./scene");
const HeaderView = require("./headerView");
const TotalView = require("./totalView");
const PerPlotView = require("./perPlotView");
const FinalView = require("./finalView");
const ScoopsView = require("./scoopsView");

let listener = null;
let scene = null;

function handleExit({reason}) {
	
	scene.destroy();
	if(reason === 'abort'){
		console.log('Plotting aborted by user!');
		console.log(`Note, that the last written plot in ${$.selectOutputPath()} may not be valid`);
		process.exit(0);
		return;
	}
	
	let message;
	if ($.selectHasError()) {
		message = `Error: ` + $.selectError();
	}
	else {
		message = "Validated Plots: \n";
		message += `Path: ${$.selectOutputPath()}\n`;
		message += $.selectValidatedPlots().map(v => `${v.plot} is ${v.isValid ? "VALID" : "NOT VALID"}`).join("\n");
		message += "\n\nHappy Mining!";
		
	}

	console.log(message);
	process.exit(0);
}

function start() {
	
	scene = new Scene();
	scene.addView("header", HeaderView);
	scene.addView("total", TotalView);
	scene.addView("perPlot", PerPlotView);
	scene.addView("scoopsView", ScoopsView);
	scene.addView("final", FinalView);
	scene.onExit(handleExit);
	// for some reasons need to wrap render() in an arrow function, otherwise it doesn't work
	listener = store.listen(() => scene.render());
	
}

function stop() {
	store.unlisten(listener);
}

module.exports = {
	start,
	stop
};

