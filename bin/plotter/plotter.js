let eventuallyMovePlot = (() => {
	var _ref2 = _asyncToGenerator(function* (plotPath, targetPath) {
		if (targetPath === plotPath) return;

		const currentPlotFile = getNewestFileInDirectory(plotPath);

		if (!currentPlotFile) return;

		const targetPathAbsolute = path.join(targetPath, path.basename(currentPlotFile));
		try {
			logger.info("Moving plot file...", { from: currentPlotFile, to: targetPathAbsolute });
			yield fs.move(currentPlotFile, targetPathAbsolute, { overwrite: true });
			logger.info("Moved plot file successfully", { from: currentPlotFile, to: targetPathAbsolute });
		} catch (e) {
			logger.info("Error - Moved plot file failed", { from: currentPlotFile, to: targetPathAbsolute, error: e });
			throw e;
		}
	});

	return function eventuallyMovePlot(_x2, _x3) {
		return _ref2.apply(this, arguments);
	};
})();

let cleanExit = (() => {
	var _ref3 = _asyncToGenerator(function* (exitCode) {

		if ($.selectIsLogEnabled()) {
			console.log("Flushing logs...please wait");
			yield logger.flush();
		}
		process.exit(exitCode);
	});

	return function cleanExit(_x4) {
		return _ref3.apply(this, arguments);
	};
})();

let exitHandler = (() => {
	var _ref4 = _asyncToGenerator(function* (reason) {

		if (reason === 'abort') {
			logger.info("Plotting aborted by user!");
			console.log('Plotting aborted by user!');
			console.log(`Note, that the last written plot in ${$.selectOutputPath()} may not be valid`);
			yield cleanExit(0);
			return;
		}

		if ($.selectHasError()) {
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

	return function exitHandler(_x5) {
		return _ref4.apply(this, arguments);
	};
})();

let start = (() => {
	var _ref5 = _asyncToGenerator(function* ({ totalNonces, plots, accountId, plotPath, targetPath, threads, memory }) {

		view.run(exitHandler);

		// view listens to store, hence updates itself on state changes
		const interval = setInterval(function () {
			store.update(function () {
				return {
					currentTime: Date.now()
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

				logger.info("Starts new plot file", store.get());

				yield execPlotter({
					accountId,
					plotPath,
					startNonce: plot.startNonce,
					nonces: plot.nonces,
					threads,
					memory
				});

				yield eventuallyMovePlot(plotPath, targetPath);

				cache.update({ lastNonce: plot.startNonce + plot.nonces }, $.selectCacheFile());

				if (!isLastPlot) {
					yield notification.sendSinglePlotCompleted();
				}

				logger.info("Successfully wrote new plot file", store.get());
			}

			yield notification.sendAllPlotsCompleted();

			store.update(function () {
				return {
					done: true
				};
			});

			yield execValidator(targetPath);
		} catch (e) {

			store.update(function () {
				return {
					error: e,
					done: true
				};
			});

			yield notification.sendFailure(e);
		} finally {
			clearInterval(interval);
		}
	});

	return function start(_x6) {
		return _ref5.apply(this, arguments);
	};
})();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const { spawn } = require('child_process');
const path = require("path");
const fs = require("fs-extra");
const cache = require('../cache');
const { XPLOTTER_SSE_EXE, XPLOTTER_AVX_EXE, XPLOTTER_AVX2_EXE } = require('../config');
const execValidator = require("../validator/validator");
const { getNewestFileInDirectory } = require("../utils");

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

module.exports = {
	start
};
