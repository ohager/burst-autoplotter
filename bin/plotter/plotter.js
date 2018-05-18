var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

let waitForMovingPlotFinished = (() => {
	var _ref2 = _asyncToGenerator(function* () {
		return new Promise(function (resolve) {
			const interval = setInterval(function () {
				if (!$.selectIsMovingPlot()) {
					clearInterval(interval);
					resolve();
				}
			}, 500);
		});
	});

	return function waitForMovingPlotFinished() {
		return _ref2.apply(this, arguments);
	};
})();

let movePlot = (() => {
	var _ref3 = _asyncToGenerator(function* (plotPath, targetPath) {

		yield waitForMovingPlotFinished();

		//console.log("Moving plot file...", {from: currentPlotFile, to: targetPathAbsolute});
		//logger.info("Moving plot file...", {from: currentPlotFile, to: targetPathAbsolute});
		store.update(function (state) {
			return {
				movePlot: _extends({}, state.movePlot, {
					startTime: Date.now()
				})
			};
		});

		return moveFile(plotPath, targetPath, updateMovePlotProgress).then(function (status) {
			updateMovePlotProgress(status);
			if (!status.error) {
				logger.info("Moved plot file successfully", { from: plotPath, to: targetPath });
			}
			return status;
		}).catch(setDone);
	});

	return function movePlot(_x2, _x3) {
		return _ref3.apply(this, arguments);
	};
})();

let eventuallyMovePlot = (() => {
	var _ref4 = _asyncToGenerator(function* (plotPath, targetPath) {
		if (targetPath === plotPath) return Promise.resolve();

		const currentPlotFile = getNewestFileInDirectory(plotPath);

		if (!currentPlotFile) return Promise.resolve();

		const targetPathAbsolute = path.join(targetPath, path.basename(currentPlotFile));

		return movePlot(currentPlotFile, targetPathAbsolute);
	});

	return function eventuallyMovePlot(_x4, _x5) {
		return _ref4.apply(this, arguments);
	};
})();

let cleanExit = (() => {
	var _ref5 = _asyncToGenerator(function* (exitCode) {

		if ($.selectIsLogEnabled()) {
			console.log("Flushing logs...please wait");
			yield logger.flush();
		}
		process.exit(exitCode);
	});

	return function cleanExit(_x6) {
		return _ref5.apply(this, arguments);
	};
})();

let exitHandler = (() => {
	var _ref6 = _asyncToGenerator(function* (reason) {

		if (reason === 'abort') {
			logger.info("Plotting aborted by user!");
			console.log('Plotting aborted by user!');
			console.log(`Note, that the last written plot in ${$.selectOutputPath()} may not be valid`);
			yield cleanExit(0);
			return;
		}

		if (reason === 'error') {
			logger.error("Error:", store.get());
			console.log(`Error: ` + $.selectError());
			yield cleanExit(-1);
			return;
		}

		logger.info("Finished Successfully");

		let message;
		message = "Validated Plots: \n";
		message += `Path: ${$.selectOutputPath()}\n`;
		message += $.selectValidatedPlots().map(function (v) {
			return `${v.plot} is ${v.isValid ? "VALID" : "NOT VALID"}`;
		}).join("\n");
		message += "\n\nHappy Mining!";

		console.log(message);

		yield cleanExit(0);
	});

	return function exitHandler(_x7) {
		return _ref6.apply(this, arguments);
	};
})();

let start = (() => {
	var _ref7 = _asyncToGenerator(function* ({ totalNonces, plots, accountId, plotPath, targetPath, threads, memory }) {

		let interval = null;
		try {

			if (!isDevelopmentMode()) {
				view.run(exitHandler);
			} else {
				store.listen(function (state) {
					return console.log(state);
				});
			}

			// view listens to store, hence updates itself on state changes
			interval = setInterval(function () {
				store.update(function () {
					return {
						currentTime: Date.now()
					};
				});
			}, 1000);

			for (let i = 0; i < plots.length; ++i) {

				const isLastPlot = i === plots.length - 1;
				const plot = plots[i];

				// reset current plot state
				store.update(function () {
					return {
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
						}
					};
				});

				logger.info("Starts new plot file", store.get());

				yield execPlotter({
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
					yield notification.sendSinglePlotCompleted();
				}

				cache.update({ lastNonce: plot.startNonce + plot.nonces }, $.selectCacheFile());
				logger.info("Successfully wrote new plot file", store.get());
			}

			yield eventuallyMovePlot(plotPath, targetPath);
			yield notification.sendAllPlotsCompleted();

			setDone();

			yield execValidator(targetPath);
		} catch (e) {

			console.log("Wacky. Something failed", e);
			setDone(e);
			yield notification.sendFailure(e);
		} finally {
			clearInterval(interval);
		}
	});

	return function start(_x8) {
		return _ref7.apply(this, arguments);
	};
})();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const { spawn } = require('child_process');
const path = require("path");
const moveFile = require("../moveFile");
const cache = require('../cache');
const { XPLOTTER_SSE_EXE, XPLOTTER_AVX_EXE, XPLOTTER_AVX2_EXE } = require('../config');
const execValidator = require("../validator/validator");
const { getNewestFileInDirectory, isDevelopmentMode } = require("../utils");

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
	}));
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

const execPlotter = (() => {
	var _ref = _asyncToGenerator(function* (args) {

		const { accountId, startNonce, nonces, threads, plotPath, memory } = args;

		// Xplotter.exe -id <ID> -sn <start_nonce> [-n <nonces>] -t <threads> [-path <d:/plots>] [-mem <8G>]
		let plotterArgs = ['-id', accountId, '-sn', startNonce, '-n', nonces, '-path', plotPath.endsWith('/') ? plotPath : plotPath + '/', '-t', threads];

		// optional args
		if (memory) {
			plotterArgs.push('-mem', `${memory}M`);
		}

		return new Promise(function (resolve, reject) {

			const process = spawn(getPlotterPath(), plotterArgs);

			logger.info("Spawned plotter process", {
				plotter: getPlotterPath(),
				args: plotterArgs
			});

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

function updateMovePlotProgress(progress) {

	store.update(state => ({
		movePlot: _extends({}, state.movePlot, progress)
	}));
}

module.exports = {
	start
};