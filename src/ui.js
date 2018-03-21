const os = require('os');
const {prompt} = require('inquirer');
const emailValidator = require("email-validator");
const diskInfo = require('fd-diskspace').diskSpaceSync();

const {b2mib, b2gib} = require('./utils');

const availableDrives = Object.keys(diskInfo.disks);

const availableCPUs = os.cpus().length;
const availableRAM_bytes = os.freemem();
const availableRAM_mib = Math.floor(b2mib(availableRAM_bytes));

function startQuestions(defaults, options) {
	
	const questions = [
		{
			type: "input",
			name: "accountId",
			message: "What's your numeric BURST Account ID?",
			validate: v => {
				const isValid = /^\d{18,}$/.test(v);
				return isValid ? true : "Use your *numeric* account ID (minimum 18 digits), dude!"
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

function nextQuestions(defaults, options, previousAnswers) {
	
	const {hardDisk} = previousAnswers;
	const selectedDrive = diskInfo.disks[hardDisk];
	const maxAvailableSpaceGiB = b2gib(selectedDrive.free).toFixed(2);
	const defaultChunkCount = Math.ceil(maxAvailableSpaceGiB / 250);
	
	let threadChoices = [];
	for (let i = 1; i <= availableCPUs; ++i) threadChoices.push(i + '');
	const defaultThreads = availableCPUs - 1;
	
	let ramChoices = [];
	const ram = Math.floor(availableRAM_mib);
	for (let i = 1; (i * 1024) < ram; ++i) ramChoices.push(i * 1024 + '');
	const defaultMemory = ramChoices[ramChoices.length - 1];
	
	const instSetChoices = options.instructionSetInfo.supported;
	const defaultInstSet = options.instructionSetInfo.recommended;
	
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
					isValid = s >= 1 && s <= maxAvailableSpaceGiB;
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
		}
	];
	
	if (options.extended) {
		nextQuestions.push(
			{
				type: "list",
				name: "threads",
				message: "How many threads do you want to use? (the more the faster the plotting)",
				default: defaultThreads,
				choices: threadChoices
			},
			{
				type: "list",
				name: "memory",
				message: `How much RAM do you want to use? (Free: ${availableRAM_mib} MiB)`,
				default: defaultMemory,
				choices: ramChoices
			},
			{
				type: "list",
				name: "instructionSet",
				message: "Select Instruction Set?",
				default: defaultInstSet,
				choices: instSetChoices
			}
		);
	}
	
	return prompt(nextQuestions).then(nextAnswers => {
		
		nextAnswers.threads = nextAnswers.threads || defaultThreads;
		nextAnswers.memory = nextAnswers.memory || defaultMemory;
		nextAnswers.instructionSet = nextAnswers.instructionSet || defaultInstSet;
		
		return {
			...previousAnswers,
			...nextAnswers
		}
	})
}


function mailQuestions(defaults, options, previousAnswers) {
	
	if (!options.mail) return null;
	
	const defaultMail = defaults.email || "you@mail.com";
	const defaultSmtp = defaults.smtp || {
		host: "smtp.mailtrap.io",
		port: 2525,
		secure: true,
		auth: {
			user: "user",
			pass: "password"
		}
	};
	
	const questions = [
		{
			type: "input",
			name: "email",
			message: "What's your email address?",
			validate: email => {
				return emailValidator.validate(email) ? true : "I need a valid email address, man!"
			},
			default: defaultMail
		},
		{
			type: "input",
			name: "host",
			message: "Enter the SMTP host",
			default: defaultSmtp.host,
		},
		{
			type: "input",
			name: "port",
			message: "Enter the hosts port",
			validate: port => {
				return /^\d{4}$/.test(port) ? true : "Port must be a number!"
			},
			default: defaultSmtp.port,
		},
		{
			type: "confirm",
			name: "secure",
			message: "Does it use TLS/SSL",
			default: defaultSmtp.secure,
		},
		{
			type: "input",
			name: "user",
			message: "SMTP Account User",
			default: defaultSmtp.auth.user,
		},
		{
			type: "password",
			name: "pass",
			mask: "*",
			message: "SMTP Account Password",
			default: defaultSmtp.auth.pass,
		}
	];
	
	return prompt(questions).then(answers => {
		return {
			...previousAnswers,
			email: answers.mail || defaultMail,
			smtp: {
				host: answers.host || defaultSmtp.host,
				port: answers.port || defaultSmtp.port,
				secure: answers.secure || defaultSmtp.secure,
				auth: {
					user: answers.user || defaultSmtp.auth.user,
					pass: answers.pass || defaultSmtp.auth.pass,
				}
			}
		}
	});
}


function run(defaults, opts) {
	return startQuestions(defaults, opts)
		.then(nextQuestions.bind(null, defaults, opts))
		.then(mailQuestions.bind(null, defaults, opts))
}

module.exports = {
	run
};