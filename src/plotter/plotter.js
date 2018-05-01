const {spawn} = require('child_process');
const path = require("path");
const fs = require("fs-extra");
const cache = require('../cache');
const {XPLOTTER_SSE_EXE, XPLOTTER_AVX_EXE, XPLOTTER_AVX2_EXE} = require('../config');
const execValidator = require("../validator/validator");
const {getNewestFileInDirectory} = require("../utils");

const store = require("../store");
const $ = require("../selectors");
const view = require("../views/blessed");
const logger = require("../logger");
const handleStdoutData = require("./stdoutHandler");
const handleClose = require("./closeHandler");
const notification = require("../notification");

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
		
		logger.info("Plot started", store.get());
		
		process.stdout.on('data', handleStdoutData);
		
		process.stderr.on('data', err => {
			//logger.error("Plot error", store.get(), err.toString());
			reject(err.toString());
		});
		
		process.on('close', code => {
			handleClose(code);
			//log.info("Plot finished", store.get());
			resolve();
		});
		
	});
	
};

function eventuallyMovePlot(plotPath, targetPath, {sync = false}) {
	if (targetPath === plotPath) return;
	
	const currentPlotFile = getNewestFileInDirectory(plotPath);
	
	if (currentPlotFile) {
		// move file asynchronously, if it's not the last plotfile...
		// ...just to not make the plotter wait for moving plot
		const moveFn = sync ? fs.moveSync : fs.move;
		moveFn(currentPlotFile, path.join(targetPath, path.basename(currentPlotFile)), {overwrite: true});
	}
}

function exitHandler(reason) {
	
	if (reason === 'abort') {
		console.log('Plotting aborted by user!');
		console.log(`Note, that the last written plot in ${$.selectOutputPath()} may not be valid`);
		process.exit(0);
		return;
	}
	
	if ($.selectHasError()) {
		console.log(`Error: ` + $.selectError());
		process.exit(-1);
		return;
	}
	
	let message;
	message = "Validated Plots: \n";
	message += `Path: ${$.selectOutputPath()}\n`;
	message += $.selectValidatedPlots().map(v => `${v.plot} is ${v.isValid ? "VALID" : "NOT VALID"}`).join("\n");
	message += "\n\nHappy Mining!";
	
	console.log(message);
	process.exit(0);
}


async function start({totalNonces, plots, accountId, plotPath, targetPath, threads, memory}) {
	
	view.run(exitHandler);
	
	const interval = setInterval(() => {
		store.update(() => ({
			elapsedTime: Date.now()
		}));
	}, 1000);
	
	try {
		for (let i = 0; i < plots.length; ++i) {
			
			const isLastPlot = i === plots.length - 1;
			const plot = plots[i];
			
			// reset current plot state
			store.update(() => ({
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
			
			await execPlotter({
				accountId,
				plotPath,
				startNonce: plot.startNonce,
				nonces: plot.nonces,
				threads,
				memory
			});
			
			eventuallyMovePlot(plotPath, targetPath, {sync: isLastPlot});
			
			cache.update({lastNonce: plot.startNonce + plot.nonces}, $.selectCacheFile());
			
			if (!isLastPlot) {
				await notification.sendSinglePlotCompleted();
			}
			
		}
		
		await notification.sendAllPlotsCompleted();
		
		store.update(() => ({
				done: true
			})
		);
		
		await execValidator(targetPath);
		
	} catch (e) {
		
		store.update(() => ({
				error: e,
				done: true
			})
		);
		
		await notification.sendFailure(e);
		
	} finally {
		clearInterval(interval);
	}
	
}

module.exports = {
	start
};
