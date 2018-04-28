let start = (() => {
	var _ref2 = _asyncToGenerator(function* ({totalNonces, plots, accountId, plotPath, targetPath, threads, memory}) {
		
		view.start();
		
		const interval = setInterval(function () {
			store.update(function () {
				return {
					elapsedTime: Date.now()
				};
			});
		}, 1000);
		
		try {
			for (let i = 0; i < plots.length; ++i) {
				
				const isLastPlot = i === plots.length - 1;
				const plot = plots[i];
				
				// reset current plot state
				store.update(function () {
					return {
						currentPlot: {
							index: i + 1,
							nonces: plot.nonces,
							writtenNonces: 0,
							avx: {
								chunkPercentage: 0.0,
								chunkStart: 0,
								chunkEnd: 0
							}
						}
					};
				});
				
				// may reject
				yield execPlotter({
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
					yield notification.sendSinglePlotCompleted();
				}
			}
			
			yield execValidator(targetPath);
			
			store.update(function () {
				return {
					done: true
				};
			});
			
			yield notification.sendAllPlotsCompleted();
		} catch (e) {
			
			// catching here to show messages in view
			// TODO: introduce a message view in UI
			store.update(function () {
				return {
					error: e,
					done: true
				};
			});
			
			yield notification.sendFailure(e);
			throw e;
		} finally {
			clearInterval(interval);
			view.stop();
		}
	});
	
	return function start(_x2) {
		return _ref2.apply(this, arguments);
	};
})();

function _asyncToGenerator(fn) {
	return function () {
		var gen = fn.apply(this, arguments);
		return new Promise(function (resolve, reject) {
			function step(key, arg) {
				try {
					var info = gen[key](arg);
					var value = info.value;
				} catch (error) {
					reject(error);
					return;
				}
				if (info.done) {
					resolve(value);
				} else {
					return Promise.resolve(value).then(function (value) {
						step("next", value);
					}, function (err) {
						step("throw", err);
					});
				}
			}
			
			return step("next");
		});
	};
}

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

const execPlotter = (() => {
	var _ref = _asyncToGenerator(function* (args) {
		
		const {accountId, startNonce, nonces, threads, plotPath, memory} = args;
		
		// Xplotter.exe -id <ID> -sn <start_nonce> [-n <nonces>] -t <threads> [-path <d:/plots>] [-mem <8G>]
		let plotterArgs = ['-id', accountId, '-sn', startNonce, '-n', nonces, '-path', plotPath.endsWith('/') ? plotPath : plotPath + '/', '-t', threads];
		
		// optional args
		if (memory) {
			plotterArgs.push('-mem', `${memory}M`);
		}
		
		return new Promise(function (resolve, reject) {
			
			const process = spawn(getPlotterPath(), plotterArgs);
			
			process.stdout.on('data', handleStdoutData);
			
			process.stderr.on('data', function (err) {
				reject(err.toString());
			});
			
			process.on('close', function (code) {
				handleClose(code);
				resolve();
			});
		});
	});
	
	return function execPlotter(_x) {
		return _ref.apply(this, arguments);
	};
})();

function eventuallyMovePlot(plotPath, targetPath, {sync = false}) {
	if (targetPath === plotPath) return;
	
	const currentPlotFile = getNewestFileInDirectory(plotPath);
	
	if (!currentPlotFile) return;
	
	// move file asynchronously, if it's not the last plotfile...
	// ...just to not make the plotter wait for moving plot
	const moveFn = sync ? fs.moveSync : fs.move;
	moveFn(currentPlotFile, path.join(targetPath, path.basename(currentPlotFile)), {overwrite: true});
}

module.exports = {
	start
};
