var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

const os = require('os');
const { prompt } = require('inquirer');
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

function nextQuestions(defaults, options, previousAnswers) {

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

	const nextQuestions = [{
		type: "input",
		name: "totalPlotSize",
		message: `What's your total plot size [GiB] - Available: ${maxAvailableSpaceGiB} GiB?`,
		default: maxAvailableSpaceGiB,
		validate: v => {
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
		validate: v => {
			const isValid = /^\d+$/.test(v) && v >= 1 && v <= 100;
			return isValid ? true : "Must be between 1 and 100";
		},
		default: defaultChunkCount
	}, {
		type: "input",
		name: "startNonce",
		message: "What's your start nonce?",
		validate: v => {
			return (/^\d+$/.test(v) ? true : "Nonce is a numeric value, man!"
			);
		},
		default: defaults.lastNonce ? defaults.lastNonce + 1 : 0
	}, {
		type: "list",
		name: "threads",
		message: "How many threads do you want to use? (the more the faster the plotting)",
		default: defaultThreads,
		when: () => options.extended,
		choices: threadChoices
	}, {
		type: "list",
		name: "memory",
		message: `How much RAM do you want to use? (Free: ${availableRAM_mib} MiB)`,
		default: defaultMemory,
		when: () => options.extended,
		choices: ramChoices
	}, {
		type: "list",
		name: "instructionSet",
		message: "Select Instruction Set?",
		default: defaultInstSet,
		when: () => options.extended,
		choices: instSetChoices
	}];

	return prompt(nextQuestions).then(nextAnswers => {

		nextAnswers.threads = nextAnswers.threads || defaultThreads;
		nextAnswers.memory = nextAnswers.memory || defaultMemory;
		nextAnswers.instructionSet = nextAnswers.instructionSet || defaultInstSet;

		return _extends({
			cacheFile: options.cache
		}, previousAnswers, nextAnswers);
	});
}

function movePlotQuestions(defaults, options, previousAnswers) {

	const defaultAnswers = {
		plotDisk: previousAnswers.targetDisk
	};

	if (availableDrives.length === 1) {
		return _extends({}, previousAnswers, defaultAnswers);
	}

	const { targetDisk } = previousAnswers;

	const choices = availableDrives.filter(d => d !== targetDisk);

	const questions = [{
		type: "confirm",
		name: "isMovingPlot",
		message: `Do you want to plot on another drive and then move to drive [${targetDisk}]`,
		default: false
	}, {
		type: "list",
		name: "plotDisk",
		message: "Select the disk to use for creating the plot?",
		when: answers => answers.isMovingPlot,
		choices: choices,
		default: choices[0]
	}];

	return prompt(questions).then(movePlotAnswers => {
		return _extends({}, previousAnswers, movePlotAnswers);
	});
}

function ask(options) {

	const instructionSetInfo = getInstructionSetInformation();
	const defaults = cache.load(options.cache);

	options = _extends({}, options, { instructionSetInfo });

	return firstQuestions(defaults).then(nextQuestions.bind(null, defaults, options)).then(movePlotQuestions.bind(null, defaults, options));
}

module.exports = {
	ask
};