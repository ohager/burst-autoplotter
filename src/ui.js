const os = require('os');
const fs = require('fs');
const prompt = require('inquirer').prompt;
const diskInfo = require('fd-diskspace').diskSpaceSync();

const {b2mib, b2gib} = require('./utils');

const availableDrives = Object.keys(diskInfo.disks);

const availableCPUs = os.cpus().length;
const availableRAM_bytes = os.freemem();
const availableRAM_mib = Math.floor(b2mib(availableRAM_bytes));

function startQuestions(defaults) {
	
	const questions = [
		{
			type: "input",
			name: "accountId",
			message: "What's your numeric BURST Account ID?",
			validate: v => {
				const isValid = /^\d{20}$/.test(v);
				return isValid ? true : "Use your *numeric* account ID (20 digits), dude!"
			},
			default: defaults.accountId
		},
		{
			type: "list",
			name: "hardDisk",
			message: "Select your disk to plot?",
			choices: availableDrives,
		}
	];
	
	return prompt(questions)
}

function nextQuestions(defaults, previousAnswers) {
	
	const {hardDisk} = previousAnswers;
	const selectedDrive = diskInfo.disks[hardDisk];
	const maxAvailableSpaceGiB = b2gib(selectedDrive.free).toFixed(2);
	const defaultChunkCount = Math.ceil(maxAvailableSpaceGiB / 250);
	const threadChoices = [];
	for(let i=1; i<=availableCPUs;++i) threadChoices.push(i + '');
	
	const ramChoices = [];
	const ram = Math.floor(availableRAM_mib);
	for(let i=1; (i*1024)<ram ;++i) ramChoices.push(i*1024 + '');
	
	const nextQuestions = [
		{
			type: "input",
			name: "totalPlotSize",
			message: `What's your total plot size [GiB] - Available: ${maxAvailableSpaceGiB} GiB?`,
			default: maxAvailableSpaceGiB,
			validate: v => {
				let isValid = false;
				try {
					const s = parseFloat(v);
					isValid = s >= 10 && s <= maxAvailableSpaceGiB;
				} catch (e) {
					// noop isValid remains false!
				}
				return isValid ? true : `Value must be numeric and must be between 10 and ${maxAvailableSpaceGiB} GiB`
			}
		},
		{
			type: "input",
			name: "chunks",
			message: "In how many chunks do you want to split your plot?",
			validate: v => {
				const isValid = /^\d+$/.test(v) && v >= 1 && v <= 100;
				return isValid ? true : "Must be between 1 and 100"
			},
			default: defaultChunkCount,
		},
		{
			type: "input",
			name: "startNonce",
			message: "What's your start nonce?",
			validate: v => {
				return /^\d+$/.test(v) ? true : "Nonce is a numeric value, man!";
			},
			default: defaults.lastNonce ? defaults.lastNonce + 1 : 0
		},
		{
			type: "list",
			name: "threads",
			message: "How many threads do you want to use? (the more the faster the plotting)",
			default: (availableCPUs - 1) - 1,
			choices: threadChoices
		},
		{
			type: "list",
			name: "memory",
			message: `How much RAM do you want to use? (Free: ${availableRAM_mib} MiB)`,
			default: ramChoices[(ramChoices.length - 1) - 1],
			choices: ramChoices
		},
	];
	
	return prompt(nextQuestions).then(nextAnswers => {
		return Object.assign({}, previousAnswers, nextAnswers)
	})
}


function _run(defaults){
	return startQuestions(defaults)
		.then(nextQuestions.bind(null, defaults))
}

module.exports = {
	run: _run
};