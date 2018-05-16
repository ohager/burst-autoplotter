const {spawn} = require('child_process');
const fs = require("fs-extra");
const path = require("path");
const moveFile = require("../moveFile");
const cache = require('../cache');
const {XPLOTTER_SSE_EXE, XPLOTTER_AVX_EXE, XPLOTTER_AVX2_EXE} = require('../config');
const execValidator = require("../validator/validator");
const {getNewestFileInDirectory, isDevelopmentMode} = require("../utils");

const store = require("../store");
const $ = require("../selectors");
const view = require("../views/blessed");
const logger = require("../logger");
const handleStdoutData = require("./stdoutHandler");
const handleClose = require("./closeHandler");
const notification = require("../notification");

function setDone(e) {
	store.update(() => ({
			error: e || null,
			done: true
		})
	);
}

const getPlotterPath = () => {
	
	const instSet = $.selectInstructionSet();
	
	const exeDir = "../../exe";
	switch (instSet) {
		case 'SSE':
			return path.join(__dirname, exeDir, XPLOTTER_SSE_EXE);
		case 'AVX':
			return path.join(__dirname, exeDir, XPLOTTER_AVX_EXE);
		case 'AVX2':
			return path.join(__dirname, exeDir, XPLOTTER_AVX2_EXE);
		default:
			throw "Unknown Instruction Set " + instSet;
	}
};

const execPlotter = async (args) => {
	
	const {accountId, startNonce, nonces, threads, plotPath, memory} = args;
	
	// Xplotter.exe -id <ID> -sn <start_nonce> [-n <nonces>] -t <threads> [-path <d:/plots>] [-mem <8G>]
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
		
		logger.info("Spawned plotter process", {
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
	
	//console.log("Moving plot file...", {from: currentPlotFile, to: targetPathAbsolute});
	//logger.info("Moving plot file...", {from: currentPlotFile, to: targetPathAbsolute});
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
				logger.info("Moved plot file successfully", {from: plotPath, to: targetPath});
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
	
	if ($.selectIsLogEnabled()) {
		console.log("Flushing logs...please wait");
		await logger.flush();
	}
	process.exit(exitCode)
}

async function exitHandler(reason) {
	
	if (reason === 'abort') {
		logger.info("Plotting aborted by user!");
		console.log('Plotting aborted by user!');
		console.log(`Note, that the last written plot in ${$.selectOutputPath()} may not be valid`);
		await cleanExit(0);
		return;
	}
	
	if (reason === 'error') {
		logger.error("Error:", store.get());
		console.log(`Error: ` + $.selectError());
		await cleanExit(-1);
		return;
	}
	
	logger.info("Finished Successfully");
	
	let message;
	message = "Validated Plots: \n";
	message += `Path: ${$.selectOutputPath()}\n`;
	message += $.selectValidatedPlots().map(v => `${v.plot} is ${v.isValid ? "VALID" : "NOT VALID"}`).join("\n");
	message += "\n\nHappy Mining!";
	
	console.log(message);
	
	await cleanExit(0);
}

function assertTargetPathPermitted(targetPath) {
	const testFile = path.join(targetPath, 'test.txt');
	fs.ensureDirSync(targetPath);
	fs.outputFileSync(testFile, "test");
	fs.removeSync(testFile);
}

async function start({totalNonces, plots, accountId, plotPath, targetPath, threads, memory}) {

	let interval = null;
	try {
		assertTargetPathPermitted(targetPath);
		
		if (!isDevelopmentMode()) {
			view.run(exitHandler);
		}
		else {
			store.listen(state => console.log(state));
		}
		
		// view listens to store, hence updates itself on state changes
		interval = setInterval(() => {
			store.update(() => ({
				currentTime: Date.now()
			}));
		}, 1000);
		
		for (let i = 0; i < plots.length; ++i) {
			
			const isLastPlot = i === plots.length - 1;
			const plot = plots[i];
			
			// reset current plot state
			store.update(() => ({
					message: "",
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
			
			logger.info("Starts new plot file", store.get());
			
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
			logger.info("Successfully wrote new plot file", store.get());
		}
		
		await eventuallyMovePlot(plotPath, targetPath);
		await notification.sendAllPlotsCompleted();
		
		setDone();
		
		await execValidator(targetPath);
		
	} catch (e) {
		
		console.log("Shakky. Something failed", e);
		setDone(e);
		await notification.sendFailure(e);
		
	} finally {
		clearInterval(interval);
	}
	
}

module.exports = {
	start
};
