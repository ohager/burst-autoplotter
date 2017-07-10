const commandLineArgs = require('command-line-args');

const plotter = require("./src/plot");
const createPartition = require("./src/partitioner").create;
const setup = require("./src/ui");
const cacheHandler = require("./src/cache");

const optionDefinitions = [
	{name: 'cache', alias: 'c', type: String},
];

const options = commandLineArgs(optionDefinitions);

const cache = cacheHandler.load(options.cache);

setup.run(cache)
	.then(answers => {
		cacheHandler.update(answers, options.cache);
		return answers
	}).then(answers => {
	
	const {plotterPath, accountId, hardDisk, startNonce, totalPlotSize, chunks, threads, memory} = answers;
	
	const path = `${hardDisk}:/burst/plots`;
	
	console.log("answers", answers);
	
	const partition = createPartition(totalPlotSize, startNonce, chunks);
	
	console.log("Created Partition", partition);
	
	const parts = partition.parts;
	const lastPart = parts[parts.length - 1];
	
	cacheHandler.update({lastNonce: lastPart.startNonce + lastPart.nonces}, options.cache);
	
	for (let i = 0; i < parts.length; ++i) {
		const partition = parts[i];
		plotter.start(
			{
				accountId,
				path,
				startNonce: partition.startNonce,
				nonces: partition.nonces,
				threads,
				memory
			})
	}
	
	
})
;

