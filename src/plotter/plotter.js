const fs = require('fs');
const {spawn} = require('child_process');
const path = require('path');
const chalk = require('chalk');
const moveFile = require('../moveFile');
const cache = require('../cache');
const {PLOTTER_SSE_EXE, PLOTTER_AVX_EXE, PLOTTER_AVX2_EXE} = require('../config');
const {getNewestFileInDirectory, isDevelopmentMode,formatTimeString} = require('../utils');

const store = require('../store');
const $ = require('../selectors');
const view = require('../views/blessed');
const logger = require('../logger');
const handleStdoutData = require('./stdoutHandler');
const handleClose = require('./closeHandler');
const notification = require('../notification');

function setDone(e) {
	store.update(() => ({
			error: e || null,
			done: true
		})
	);
}

const getPlotterPath = () => {

	const instSet = $.selectInstructionSet();

	const exeDir = '../../exe';
	switch (instSet) {
		case 'SSE':
			return path.join(__dirname, exeDir, PLOTTER_SSE_EXE);
		case 'AVX':
			return path.join(__dirname, exeDir, PLOTTER_AVX_EXE);
		case 'AVX2':
			return path.join(__dirname, exeDir, PLOTTER_AVX2_EXE);
		default:
			throw 'Unknown Instruction Set ' + instSet;
	}
};

const execPlotter = async (args) => {

	const {accountId, startNonce, nonces, threads, plotPath, memory} = args;

	// Splotter.exe -id <ID> -sn <start_nonce> [-n <nonces>] -t <threads> [-path <d:/plots>] [-mem <8G>]
	let plotterArgs = [
		'-id', accountId,
		'-sn', startNonce,
		'-n', nonces,
		'-path', plotPath.endsWith('/') ? plotPath : plotPath + '/',
		'-t', threads,
	];

	// optional args
	if (memory) {
		plotterArgs.push('-mem', `${memory}M`)
	}

	return new Promise((resolve, reject) => {

		const process = spawn(getPlotterPath(), plotterArgs);

		logger.info('Spawned plotter process', {
			plotter: getPlotterPath(),
			args: plotterArgs
		});

		process.stdout.on('data', handleStdoutData);

		process.stderr.on('data', err => {
			reject(err.toString());
		});

		process.on('close', code => {
			handleClose(code);
			resolve();
		});

	});

};

async function waitForMovingPlotFinished() {
	return new Promise(resolve => {
		const interval = setInterval(() => {
			if (!$.selectIsMovingPlot()) {
				clearInterval(interval);
				resolve()
			}
		}, 500)
	});
}

function updateMovePlotProgress(progress) {

	store.update(state => ({
		movePlot: {
			...state.movePlot,
			...progress
		}
	}));
}

async function movePlot(plotPath, targetPath) {

	await waitForMovingPlotFinished();

	logger.info('Moving plot file...', {from: currentPlotFile, to: targetPathAbsolute});
	store.update(state => ({
		movePlot: {
			...state.movePlot,
			startTime: Date.now(),
		}
	}));

	return moveFile(plotPath, targetPath, updateMovePlotProgress)
		.then(status => {
			updateMovePlotProgress(status);
			if (!status.error) {
				logger.info('Moved plot file successfully', {from: plotPath, to: targetPath});
			}
			return status;
		}).catch(setDone);
}

async function eventuallyMovePlot(plotPath, targetPath) {
	if (targetPath === plotPath) return Promise.resolve();

	const currentPlotFile = getNewestFileInDirectory(plotPath);

	if (!currentPlotFile) return Promise.resolve();

	const targetPathAbsolute = path.join(targetPath, path.basename(currentPlotFile));

	return movePlot(currentPlotFile, targetPathAbsolute)
}

async function cleanExit(exitCode) {

	await logger.flush();
	process.exit(exitCode);
}

async function exitHandler(reason, error) {
	const green = chalk.greenBright;
	const yellow = chalk.yellowBright;
	const white = chalk.whiteBright;

	if (reason === 'abort') {
		logger.info('Plotting aborted by user!');
		console.log('Plotting aborted by user!');
		console.log(yellow(`Note, that the last written plot in ${$.selectOutputPath()} may not be valid`));
		await cleanExit(0);
		return;
	}

	if (reason === 'error') {
		try {
			logger.error(error, {stacktrace: error.stack});
			console.error(yellow('Damn, an error occurred: ', error));
			await notification.sendFailure(error);
			await cleanExit(-1);
		} catch (e) {
			console.log(e);
		}
		return;
	}


	const plotFiles = fs.readdirSync($.selectOutputPath());

	let message;
	message = white(`Finished after ${formatTimeString($.selectElapsedTimeInSecs())}\n`);
	message += white(`Written ${($.selectTotalWrittenNonces())} nonces -> nonces/min: ${$.selectEffectiveNoncesPerSeconds()*60}\n\n`);
	message += white(`Plots in Path: ${$.selectOutputPath()}\n`);
	message += plotFiles.sort().map(fileName => green(fileName)).join('\n');
	message += yellow('\n\nHappy Mining!');

	console.log(message);
	logger.info('Finished Successfully');

	await cleanExit(0);
}

async function start({totalNonces, plots, accountId, plotPath, targetPath, threads, memory}) {

	if (!isDevelopmentMode()) {
		view.run(exitHandler);
	}
	else {
		store.listen(console.log);
	}

	// view listens to store, hence updates itself on state changes
	const interval = setInterval(() => {
		store.update(() => ({
			currentTime: Date.now()
		}));
	}, 1000);

	for (let i = 0; i < plots.length; ++i) {

		const isLastPlot = i === plots.length - 1;
		const plot = plots[i];

		// reset current plot state
		store.update(() => ({
				message: '',
				currentPlot: {
					index: i + 1,
					nonces: plot.nonces,
					writtenNonces: 0,
					avx: {
						chunkPercentage: 0.0,
						chunkStart: 0,
						chunkEnd: 0
					}
				},
			}
		));

		logger.info('Starts new plot file', store.get());

		await execPlotter({
			accountId,
			plotPath,
			startNonce: plot.startNonce,
			nonces: plot.nonces,
			threads,
			memory
		});

		if (!isLastPlot) {
			// run non-blocking plot movement
			// noinspection JSIgnoredPromiseFromCall
			eventuallyMovePlot(plotPath, targetPath);
			await notification.sendSinglePlotCompleted();
		}

		cache.update({lastNonce: plot.startNonce + plot.nonces}, $.selectCacheFile());
		logger.info('Successfully wrote new plot file', store.get());
	}

	await eventuallyMovePlot(plotPath, targetPath);
	await notification.sendAllPlotsCompleted();

	setDone();
	clearInterval(interval);
}

module.exports = {
	start
};
