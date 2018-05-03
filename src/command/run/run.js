const fs = require('fs-extra');

const questions = require("./questions");
const {isDevelopmentMode} = require('../../utils');
const store = require('../../store');
const cache = require('../../cache');
const plotter = require('../../plotter');
const createPlotPartition = require('../../plotPartition');
const logger = require("../../logger");

async function startPlotter(answers) {
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
		instructionSet,
		logEnabled,
		plotDirectory,
	} = answers;
	
	const targetPath = `${targetDisk}:${plotDirectory}`;
	const plotPath = `${plotDisk}:${plotDirectory}`;
	
	fs.ensureDirSync(plotPath);
	fs.ensureDirSync(targetPath);
	
	const {totalNonces, plots} = createPlotPartition(totalPlotSize, startNonce, chunks);
	
	store.update(() => ({
		logEnabled,
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
		plotDirectory,
		done: false,
	}));
	
	logger.info("Start plotting", answers);
	
	await plotter.start({
		totalNonces,
		plots,
		accountId,
		plotPath,
		targetPath,
		threads,
		memory,
		instSet: instructionSet,
	});
	
	logger.info("Finished plotting", answers);
	
}

function prepareDevelopmentAnswers() {
	
	return {
		accountId: '1234567890123456700',
		targetDisk: 'C',
		plotDisk: 'C',
		plotDirectory: '/Burst/plots',
		totalPlotSize: '1',
		chunks: '2',
		startNonce: '0',
		threads: 7,
		memory: '8192',
		instructionSet: 'AVX2',
		confirmed: true,
		logEnabled: true,
	};
}

function clearOldDevelopmentPlots({targetDisk, plotDisk, plotDirectory}) {
	fs.removeSync(`${targetDisk}:/${plotDirectory}`);
	if (plotDisk !== targetDisk) {
		fs.removeSync(`${plotDisk}:/${plotDirectory}`);
	}
}

async function run(options) {
	
	logger.info("Execute Autoplotter", options);
	
	if (options.version) {
		return;
	}
	
	let answers;
	if (isDevelopmentMode()) {
		answers = prepareDevelopmentAnswers();
		clearOldDevelopmentPlots(answers);
	} else {
		
		answers = await questions.ask(options);
		while (answers.rerun) {
			answers = await questions.ask(options);
		}
		cache.update(answers, options.cache);
	}
	
	if (answers.confirmed) {
		await startPlotter(answers);
	}
	
}

module.exports = run;
