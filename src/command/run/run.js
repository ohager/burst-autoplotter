const fs = require('fs-extra');

const questions = require("./questions");
const {isDevelopmentMode} = require('../../utils');
const store = require('../../store');
const cache = require('../../cache');
const plotter = require('../../plotter');
const createPlotPartition = require('../../plotPartition');
const {PLOTS_DIR} = require('../../config');

function startPlotter(answers) {
	try {
		const {
			accountId,
			cacheFile,
			hardDisk,
			startNonce,
			totalPlotSize,
			chunks,
			threads,
			memory,
			instructionSet
		} = answers;
		
		const path = `${hardDisk}:/${PLOTS_DIR}`;
		
		fs.ensureDirSync(path);
		
		const {totalNonces, plots} = createPlotPartition(totalPlotSize, startNonce, chunks);
		
		store.update(() => ({
			totalPlotSize,
			account: accountId,
			cacheFile: cacheFile,
			usedThreads: threads,
			usedMemory: memory,
			startTime: Date.now(),
			totalNonces,
			totalWrittenNonces: 0,
			totalStartNonce: +startNonce,
			instructionSet,
			outputPath: path,
			plotCount: plots.length,
			done: false,
		}));
		
		plotter.start({
			totalNonces,
			plots,
			accountId,
			path,
			threads,
			memory,
			instSet: instructionSet,
		});
		
	} catch (e) {
		console.error(`Woop: Something failed - reason: ${e}`);
		process.exit(666);
	}
}


function runPlotter(answers) {
	
	if (!isDevelopmentMode()) {
		startPlotter(answers);
		return
	}
	
	const devAnswers = {
		accountId: '1234567890123456700',
		hardDisk: 'C',
		totalPlotSize: '1',
		chunks: '2',
		startNonce: '0',
		threads: 7,
		memory: '8192',
		instructionSet: 'AVX2'
	};
	fs.removeSync(`${devAnswers.hardDisk}:/${PLOTS_DIR}`);
	startPlotter(devAnswers);
}

function run(options) {
	
	if(options.version){
		return;
	}
	
	questions.ask(options)
		.then(answers => {
			cache.update(answers, options.cache);
			return answers;
		})
		.then(runPlotter);
}

module.exports = run;