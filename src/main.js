const chalk = require('chalk');
const commandLineArgs = require('command-line-args');

const plotter = require('./plotter');
const {create: createPlotPartition} = require('./plotPartition');
const ui = require('./ui');
const cache = require('./cache');

const plotOutputPath = process.env.PLOTS_DIR;
const options = commandLineArgs([
	{name: 'cache', alias: 'c', type: String},
]);

function _run() {
	ui.run(cache.load(options.cache))
		.then(answers => {
			cache.update(answers, options.cache);
			return answers;
		}).then(answers => {
		
			const path = `${hardDisk}:/${plotOutputPath}`;
			const {accountId, hardDisk, startNonce, totalPlotSize, chunks, threads, memory} = answers;
			const {totalNonces, plots} = createPlotPartition(totalPlotSize, startNonce, chunks);
			
			const lastPlot = plots[plots.length - 1];
			cache.update({lastNonce: lastPlot.startNonce + lastPlot.nonces}, options.cache);
			
			console.log(chalk`Created partition for {whiteBright ${totalPlotSize} GiB} in {whiteBright ${chunks} chunk(s)}`);
			console.log(chalk`Overall nonces to be written: {whiteBright ${totalNonces}}`);
			
			plotter.start({
				totalNonces,
				plots,
				accountId,
				path,
				threads,
				memory
			});
		
	});
	
}

module.exports = {
	run: _run
};


//const {plotterPath, accountId, hardDisk, startNonce, totalPlotSize, chunks, threads, memory} = answers;
//const path = `${hardDisk}:/burst/plots`;

/*
 const totalPlotSize = 3.25;
 const chunks = 3;
 const {totalNonces, plots}= createPlotPartition(totalPlotSize, 0, chunks);
 
 console.log(chalk`Created partition for {whiteBright ${totalPlotSize} GiB} in {whiteBright ${chunks} chunk(s)}`);
 console.log(chalk`Overall nonces to be written: {whiteBright ${totalNonces}}`);
 
 plotter.start({
 totalNonces: totalNonces,
 plots: plots,
 accountId: 1000,
 path: "c:/Burst/testplots",
 threads: 7,
 memory: 6144
 });
 */