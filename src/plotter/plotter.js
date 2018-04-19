const {spawn} = require('child_process');
const path = require("path");
const fs = require("fs-extra");
const co = require('co');
const cache = require('../cache');
const {XPLOTTER_SSE_EXE, XPLOTTER_AVX_EXE, XPLOTTER_AVX2_EXE} = require('../config');
const execValidator = require("../validator/validator");
const {newestFileInDirectory} = require("../utils");

const store = require("../store");
const $ = require("../selectors");
const view = require("../views/blessed");

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

function eventuallyMovePlot(plotPath, targetPath, {sync = false}) {
	if (targetPath === plotPath) return;
	
	const currentPlotFile = newestFileInDirectory(plotPath);
	
	if (currentPlotFile) {
		const moveFn = sync ? fs.moveSync : fs.move;
		moveFn(currentPlotFile, path.join(targetPath, path.basename(currentPlotFile)), {overwrite: true});
	}
}

async function start({totalNonces, plots, accountId, plotPath, targetPath, threads, memory}) {
	
	view.start();
	
	const interval = setInterval(() => {
		store.update(() => ({
			elapsedTime: Date.now()
		}))
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
			
			// may reject
			await execPlotter(
				{
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
		
		await execValidator(targetPath);
		
		store.update(() => ({
				done: true
			})
		);
		
		await notification.sendAllPlotsCompleted();
		
	} catch (e) {
		
		// catching here to show messages in view
		// TODO: introduce a message view in UI
		store.update(() => ({
				error: e,
				done: true
			})
		);
		
		await notification.sendFailure(e);
		throw e;
		
	} finally {
		clearInterval(interval);
		view.stop();
	}
	
}

module.exports = {
	start
};
