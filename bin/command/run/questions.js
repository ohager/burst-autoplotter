var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

let nextQuestions = (() => {
	var _ref = _asyncToGenerator(function* (defaults, options, previousAnswers) {

		const { targetDisk } = previousAnswers;
		const selectedDrive = diskInfo.disks[targetDisk];
		const maxAvailableSpaceGiB = b2gib(selectedDrive.free).toFixed(2);
		const defaultChunkCount = Math.ceil(maxAvailableSpaceGiB / 250);

		let threadChoices = [];
		for (let i = 1; i <= availableCPUs; ++i) threadChoices.push(i + '');
		const defaultThreads = availableCPUs - 1;

		let ramChoices = [];
		const ram = Math.floor(availableRAM_mib);
		for (let i = 1; i * 1024 < ram; ++i) ramChoices.push(i * 1024 + '');
		const defaultMemory = ramChoices[ramChoices.length - 1];

		const instSetChoices = options.instructionSetInfo.supported;
		const defaultInstSet = options.instructionSetInfo.recommended;
		const defaultPlotDirectory = defaults.plotDirectory;

		const whenExtended = function () {
			return options.extended;
		};

		const nextQuestions = [{
			type: "input",
			name: "totalPlotSize",
			message: `What's your total plot size [GiB] - Available: ${maxAvailableSpaceGiB} GiB?`,
			default: maxAvailableSpaceGiB,
			validate: function (v) {
				let isValid = false;
				try {
					const s = parseFloat(v);
					isValid = s >= 1 && s <= maxAvailableSpaceGiB;
				} catch (e) {
					// noop isValid remains false!
				}
				return isValid ? true : `Value must be numeric and must be between 10 and ${maxAvailableSpaceGiB} GiB`;
			}
		}, {
			type: "input",
			name: "chunks",
			message: "In how many chunks do you want to split your plot?",
			validate: function (v) {
				const isValid = /^\d+$/.test(v) && v >= 1 && v <= 100;
				return isValid ? true : "Must be between 1 and 100";
			},
			default: defaultChunkCount
		}, {
			type: "input",
			name: "startNonce",
			message: "What's your start nonce?",
			validate: function (v) {
				return (/^\d+$/.test(v) ? true : "Nonce is a numeric value, man!"
				);
			},
			default: defaults.lastNonce ? defaults.lastNonce + 1 : 0
		}, {
			type: "input",
			name: "plotDirectory",
			message: "In which folder do you want the plot to be written? (absolute path without drive letter)",
			default: defaultPlotDirectory,
			when: whenExtended,
			validate: function (dir) {
				try {
					if (dir[0] !== '/') {
						return "Please specify the absolute path without drive letter and with trailing '/', e.g. /burst/plots";
					}
					fs.ensureDirSync(dir);
					return true;
				} catch (error) {
					return error;
				}
			},
			choices: threadChoices
		}, {
			type: "list",
			name: "threads",
			message: "How many threads do you want to use? (the more the faster the plotting)",
			default: defaultThreads,
			when: whenExtended,
			choices: threadChoices
		}, {
			type: "list",
			name: "memory",
			message: `How much RAM do you want to use? (Free: ${availableRAM_mib} MiB)`,
			default: defaultMemory,
			when: whenExtended,
			choices: ramChoices
		}, {
			type: "list",
			name: "instructionSet",
			message: "Select Instruction Set?",
			default: defaultInstSet,
			when: whenExtended,
			choices: instSetChoices
		}, {
			type: "confirm",
			name: "logEnabled",
			message: "Do you want to enable logging?",
			default: defaults.logEnabled,
			when: whenExtended
		}];

		const nextAnswers = yield prompt(nextQuestions);

		nextAnswers.threads = nextAnswers.threads || defaultThreads;
		nextAnswers.memory = nextAnswers.memory || defaultMemory;
		nextAnswers.instructionSet = nextAnswers.instructionSet || defaultInstSet;
		nextAnswers.logEnabled = nextAnswers.logEnabled || defaults.logEnabled;
		nextAnswers.plotDirectory = nextAnswers.plotDirectory || defaults.plotDirectory;

		return _extends({
			cacheFile: options.cache
		}, previousAnswers, nextAnswers);
	});

	return function nextQuestions(_x, _x2, _x3) {
		return _ref.apply(this, arguments);
	};
})();

let movePlotQuestions = (() => {
	var _ref2 = _asyncToGenerator(function* (defaults, options, previousAnswers) {

		const getDiskSpaceGiB = function (driveName) {
			return b2gib(diskInfo.disks[driveName].free).toFixed(2);
		};

		const { targetDisk, totalPlotSize, chunks } = previousAnswers;
		const requiredPlotDiskCapacityGiB = (totalPlotSize / chunks * 1.01).toFixed(2); // 1% more space required
		const choices = availableDrives.filter(function (d) {
			return d !== targetDisk && getDiskSpaceGiB(d) > requiredPlotDiskCapacityGiB;
		});

		const defaultAnswers = {
			plotDisk: previousAnswers.targetDisk
		};

		if (availableDrives.length === 1 || choices.length === 0) {
			writeHint(`To leverage the 'Move Plot'-Feature you need one more additional disk with at least ${requiredPlotDiskCapacityGiB} GiB disk space`);
		}
		if (availableDrives.length > 1 && choices.length === 0) {
			availableDrives.filter(function (d) {
				return d !== targetDisk;
			}).filter(function (d) {
				return getDiskSpaceGiB(d) < requiredPlotDiskCapacityGiB;
			}).forEach(function (d) {
				const availableGiB = getDiskSpaceGiB(d);
				const missingGiB = (requiredPlotDiskCapacityGiB - availableGiB).toFixed(2);
				console.log(chalk`{yellow · Drive ${d}: ${availableGiB} GiB available - missing ${missingGiB} GiB}`);
			});
		}

		if (availableDrives.length === 1 || choices.length === 0) {
			return _extends({}, previousAnswers, defaultAnswers);
		}

		const questions = [{
			type: "confirm",
			name: "isMovingPlot",
			message: `Do you want to plot on another drive and then move to drive [${targetDisk}]`,
			default: false
		}, {
			type: "list",
			name: "plotDisk",
			message: "Select the disk to use for creating the plot?",
			when: function (answers) {
				return answers.isMovingPlot;
			},
			choices: choices,
			default: choices[0]
		}];

		const movePlotAnswers = yield prompt(questions);

		return _extends({}, previousAnswers, defaultAnswers, movePlotAnswers);
	});

	return function movePlotQuestions(_x4, _x5, _x6) {
		return _ref2.apply(this, arguments);
	};
})();

let confirm = (() => {
	var _ref3 = _asyncToGenerator(function* (defaults, options, previousAnswers) {

		// maybe do some further validations and give some recommendations
		// - threads
		// - mem
		// - plot sizes

		const questions = [{
			type: "confirm",
			name: "confirmed",
			message: `Fine. Are your settings ok? Do you want to plot now?`,
			default: true
		}, {
			type: "confirm",
			name: "rerun",
			message: `Gotcha. Do you want to rerun the setup?`,
			when: function (answers) {
				return !answers.confirmed;
			},
			default: true
		}];

		const confirmation = yield prompt(questions);
		return _extends({}, previousAnswers, confirmation);
	});

	return function confirm(_x7, _x8, _x9) {
		return _ref3.apply(this, arguments);
	};
})();

let ask = (() => {
	var _ref4 = _asyncToGenerator(function* (options) {

		const instructionSetInfo = getInstructionSetInformation();
		const defaults = cache.load(options.cache);

		options = _extends({}, options, { instructionSetInfo });
		let answers = yield firstQuestions(defaults);
		answers = yield nextQuestions(defaults, options, answers);
		answers = yield movePlotQuestions(defaults, options, answers);
		answers = yield confirm(defaults, options, answers);

		return answers;
	});

	return function ask(_x10) {
		return _ref4.apply(this, arguments);
	};
})();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const os = require('os');
const fs = require("fs-extra");
const chalk = require("chalk");
const { prompt, ui } = require('inquirer');
const diskInfo = require('fd-diskspace').diskSpaceSync();
const { b2mib, b2gib } = require('../../utils');
const { getSupportedInstructionSets } = require('../../instructionSet');
const cache = require('../../cache');

const availableDrives = Object.keys(diskInfo.disks);
const availableCPUs = os.cpus().length;
const availableRAM_bytes = os.freemem();
const availableRAM_mib = Math.floor(b2mib(availableRAM_bytes));

const getInstructionSetInformation = () => {

	const instSet = getSupportedInstructionSets();
	let recommended = 'SSE';
	if (instSet.avx) recommended = 'AVX';
	if (instSet.avx2) recommended = 'AVX2';

	return {
		raw: instSet,
		supported: Object.keys(instSet).map(k => instSet[k] ? k.toUpperCase() : ''),
		recommended: recommended
	};
};

function firstQuestions(defaults) {

	if (!defaults.logEnabled) {
		writeHint("Currently logging is disabled. The log helps me to improve the user experience.\nI appreciate if you enable logging using the enhanced settings. Thank you.");
	}

	const questions = [{
		type: "input",
		name: "accountId",
		message: "What's your numeric BURST Account ID?",
		validate: v => {
			const isValid = /^\d{18,}$/.test(v);
			return isValid ? true : "Use your *numeric* account ID (minimum 18 digits), dude!";
		},
		default: defaults.accountId
	}, {
		type: "list",
		name: "targetDisk",
		message: "Select your disk to plot?",
		choices: availableDrives
	}];
	return prompt(questions);
}

function writeHint(text) {
	const bottomBar = new ui.BottomBar();
	bottomBar.log.write("\n");
	bottomBar.log.write(chalk`{green HINT: }{yellowBright ${text}}`);
	bottomBar.log.write("\n");
}

module.exports = {
	ask
};