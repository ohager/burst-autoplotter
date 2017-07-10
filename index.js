const commandLineArgs = require('command-line-args');

const plotter = require("./src/plotter");
const createPlotPartition = require("./src/plotPartition").create;
const ui = require("./src/ui");
const cache = require("./src/cache");

const optionDefinitions = [
	{name: 'cache', alias: 'c', type: String},
];

const options = commandLineArgs(optionDefinitions);

ui.run(cache.load(options.cache))
	.then(answers => {
		cache.update(answers, options.cache);
		return answers
	}).then(answers => {
	
	const {plotterPath, accountId, hardDisk, startNonce, totalPlotSize, chunks, threads, memory} = answers;
	const path = `${hardDisk}:/burst/plots`;
	const partition = createPlotPartition(100, 0, 3);
	
	console.log("Created Partition:", partition);
	
	const plots = partition.plots;
	
	const lastPart = plots[plots.length - 1];
	cache.update({lastNonce: lastPart.startNonce + lastPart.nonces}, options.cache);
	
	plotter.start({
		plots: plots,
		accountId: 1000,
		path: "c:/plots",
		threads: 7,
		memory: 6144
	});
	
});

/*
 //const {plotterPath, accountId, hardDisk, startNonce, totalPlotSize, chunks, threads, memory} = answers;
 //const path = `${hardDisk}:/burst/plots`;
 const partition = createPlotPartition(100, 0, 3);
 
 console.log("Created Partition:", partition);
 
 const parts = partition.parts;
 
 //const lastPart = parts[parts.length - 1];
 //cache.update({lastNonce: lastPart.startNonce + lastPart.nonces}, options.cache);
 
 plotter.start({
 plots: parts,
 accountId: 1000,
 path: "c:/plots",
 threads: 7,
 memory: 6144
 });
 */
