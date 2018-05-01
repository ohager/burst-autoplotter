const fs = require('fs-extra');

const questions = require("./questions");
const {isDevelopmentMode} = require('../../utils');
const store = require('../../store');
const cache = require('../../cache');
const plotter = require('../../plotter');
const createPlotPartition = require('../../plotPartition');
const {PLOTS_DIR} = require('../../config');
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
	
}

function prepareDevelopmentAnswers() {
	
	return {
		accountId: '1234567890123456700',
		targetDisk: 'C',
		plotDisk: 'C',
		totalPlotSize: '1',
		chunks: '2',
		startNonce: '0',
		threads: 7,
		memory: '8192',
		instructionSet: 'AVX2',
		confirmed: true,
	};
}

function clearOldDevelopmentPlots({targetDisk, plotDisk}) {
	fs.removeSync(`${targetDisk}:/${PLOTS_DIR}`);
	if (plotDisk !== targetDisk) {
		fs.removeSync(`${plotDisk}:/${PLOTS_DIR}`);
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
		logger.info("Start plotting", answers);
		await startPlotter(answers);
		logger.info("Finished plotting");
	}
	
}

module.exports = run;
