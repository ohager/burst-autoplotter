let startPlotter = (() => {
	var _ref = _asyncToGenerator(function* (answers) {
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
			plotDirectory
		} = answers;

		const targetPath = `${targetDisk}:${plotDirectory}`;
		const plotPath = `${plotDisk}:${plotDirectory}`;

		const canWriteToPaths = validatePathAccess(plotPath) && validatePathAccess(targetPath);

		if (!canWriteToPaths) {
			console.error("Check, if paths are accessible, e.g. has sufficient permissions, or has connectivity issues");
			return;
		}

		const { totalNonces, plots } = createPlotPartition(totalPlotSize, startNonce, chunks);

		store.update(function () {
			return {
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
				movePlot: {
					isEnabled: targetPath !== plotPath,
					isMoving: false
				},
				done: false
			};
		});

		logger.info("Start plotting", answers);

		yield plotter.start({
			totalNonces,
			plots,
			accountId,
			plotPath,
			targetPath,
			threads,
			memory,
			instSet: instructionSet
		});

		logger.info("Finished plotting", answers);
	});

	return function startPlotter(_x) {
		return _ref.apply(this, arguments);
	};
})();

let run = (() => {
	var _ref2 = _asyncToGenerator(function* (options) {

		logger.info("Execute Autoplotter", options);

		if (options.version) {
			return;
		}

		let answers;
		if (isDevelopmentMode()) {
			console.debug("Development Mode");
			answers = prepareDevelopmentAnswers();
			//clearOldDevelopmentPlots(answers);
		} else {

			answers = yield questions.ask(options);
			while (answers.rerun) {
				answers = yield questions.ask(options);
			}

			cache.update(answers, options.cache);
		}

		console.log(answers);

		//	return;

		if (answers.confirmed) {
			try {
				yield startPlotter(answers);
			} catch (e) {
				// TODO: log error
				console.error(e);
			}
		}
	});

	return function run(_x2) {
		return _ref2.apply(this, arguments);
	};
})();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const fs = require('fs-extra');
const questions = require("./questions");
const { isDevelopmentMode, hasAccessToPath } = require('../../utils');
const store = require('../../store');
const cache = require('../../cache');
const plotter = require('../../plotter');
const createPlotPartition = require('../../plotPartition');
const logger = require("../../logger");

function validatePathAccess(path) {
	if (!hasAccessToPath(path)) {
		console.error("Cannot write to ", path);
		return false;
	}
	return true;
}

function prepareDevelopmentAnswers() {

	return {
		accountId: '1234567890123456700',
		targetDisk: 'E',
		plotDisk: 'C',
		plotDirectory: '/Burst/plots',
		totalPlotSize: '1',
		chunks: '2',
		startNonce: '0',
		threads: 7,
		memory: '8192',
		instructionSet: 'AVX2',
		confirmed: true,
		logEnabled: true
	};
}

function clearOldDevelopmentPlots({ targetDisk, plotDisk, plotDirectory }) {
	fs.removeSync(`${targetDisk}:/${plotDirectory}`);
	if (plotDisk !== targetDisk) {
		fs.removeSync(`${plotDisk}:/${plotDirectory}`);
	}
}

module.exports = run;