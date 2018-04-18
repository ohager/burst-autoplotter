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
			targetDisk,
			plotDisk,
			startNonce,
			totalPlotSize,
			chunks,
			threads,
			memory,
			instructionSet
		} = answers;
		
		const targetPath = `${targetDisk}:/${PLOTS_DIR}`;
		const plotPath = `${plotDisk}:/${PLOTS_DIR}`;
		
		fs.ensureDirSync(plotPath);
		fs.ensureDirSync(targetPath);
		
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
			outputPath: targetPath,
			plotCount: plots.length,
			done: false,
		}));
		
		plotter.start({
			totalNonces,
			plots,
			accountId,
			plotPath,
			targetPath,
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
		targetDisk: 'C',
		plotDisk: 'C',
		totalPlotSize: '1',
		chunks: '2',
		startNonce: '0',
		threads: 7,
		memory: '8192',
		instructionSet: 'AVX2'
	};
	fs.removeSync(`${devAnswers.targetDisk}:/${PLOTS_DIR}`);
	if(devAnswers.plotDisk !== devAnswers.targetDisk){
		fs.removeSync(`${devAnswers.plotDisk}:/${PLOTS_DIR}`);
	}
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
