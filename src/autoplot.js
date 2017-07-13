require('dotenv').config();

const chalk = require('chalk');
const {version, author} = require('../package.json');
const commandLineArgs = require('command-line-args');

const plotter = require('./plotter');
const {create: createPlotPartition} = require('./plotPartition');
const ui = require('./ui');
const cache = require('./cache');

const plotOutputPath = process.env.PLOTS_DIR;
const options = commandLineArgs([
	{name: 'cache', alias: 'c', type: String},
]);


(function run() {
	
	console.log('\n');
	console.log(chalk`{whiteBright --------------------------------------------------}`);
	console.log(chalk`{blueBright.bold BURST Auto Plotter} based on XPlotter`);
	console.log(chalk`Version {whiteBright ${version}}`);
	console.log(`by ${author}`);
	console.log(chalk`{whiteBright --------------------------------------------------}`);
	console.log('\n');
	
	
	ui.run(cache.load(options.cache))
		.then(answers => {
			cache.update(answers, options.cache);
			return answers;
		}).then(answers => {
		
			const {accountId, hardDisk, startNonce, totalPlotSize, chunks, threads, memory} = answers;
			const path = `${hardDisk}:/${plotOutputPath}`;
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
	
})();