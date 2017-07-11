const commandLineArgs = require('command-line-args');

const plotter = require("./src/plotter");
const {create: createPlotPartition} = require("./src/plotPartition");
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
	const exe = `${plotterPath}/xplotter_avx.exe`;
	
	const partition = createPlotPartition(totalPlotSize, startNonce, chunks);
	console.log("Created Partition:", partition);
	
	const plots = partition.plots;
	const lastPart = plots[plots.length - 1];
	
	cache.update({lastNonce: lastPart.startNonce + lastPart.nonces}, options.cache);
	
	plotter.start({
		exe,
		plots,
		accountId,
		path,
		threads,
		memory
	});
	
});

/*
 //const {plotterPath, accountId, hardDisk, startNonce, totalPlotSize, chunks, threads, memory} = answers;
 //const path = `${hardDisk}:/burst/plots`;
 
 const partition = createPlotPartition(15, 0, 3);
 
 console.log("Created Partition:", partition);
 
 const plots = partition.plots;
 
 plotter.start({
 exe: "C:/Users/Dextra/AppData/Roaming/BurstWallet/XPlotter/Xplotter_avx.exe",
 plots: plots,
 accountId: 1000,
 path: "c:/Burst/testplots",
 threads: 7,
 memory: 6144
 });
 */