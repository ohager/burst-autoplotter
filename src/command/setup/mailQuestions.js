const {prompt} = require('inquirer');
const cache = require("../../cache");
const notification = require("../../notification");
const emailValidator = require("email-validator");


function startQuestions(defaults, options) {
	const questions = [{
		type: "confirm",
		name: "mailEnabled",
		message: "Do you want to send email notification?",
		default: (defaults.email && defaults.email.enabled) || false,
	}];
	
	return prompt(questions)
}

async function configQuestions(defaults, options, previousAnswers) {
	
	if (!previousAnswers.mailEnabled) {
		return prompt([]); // no more questions
	}
	
	const defaultMail = defaults.email || {
		enabled: previousAnswers.mailEnabled,
		address: 'yourmail@mailer.com'
	};
	
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
			default: defaultMail.address
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
				return /^\d{3,4}$/.test(port) ? true : "Port must be a number!"
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
			type: "input",
			name: "pass",
			message: "SMTP Account Password",
			default: defaultSmtp.auth.pass,
		}
	];
	
	const answers = await prompt(questions);
	return {...previousAnswers, ...answers};
}


function mapAnswers(defaults, options, answers) {
	
	const _default = (section, field) => section && section[field];
	
	return {
		...defaults,
		email: {
			enabled: !!answers.mailEnabled,
			address: answers.email || _default(defaults.email, 'address')
		},
		smtp: {
			host: answers.host || _default(defaults.smtp, 'host'),
			port: answers.port || _default(defaults.smtp, 'port'),
			secure: answers.secure === undefined ? _default(defaults.smtp, 'secure') : answers.secure,
			auth: {
				user: answers.user || _default(defaults.smtp.auth, 'user'),
				pass: answers.pass || _default(defaults.smtp.auth, 'pass'),
			}
		}
	};
}


async function ask(options) {
	
	const defaults = cache.load(options.cache);
	
	let answers = await startQuestions(defaults, options);
	answers = await configQuestions(defaults, options, answers);
	answers = await mapAnswers(defaults, options, answers);
	
	cache.update(answers, options.cache);
	
	await notification.sendMailSetupSuccessMessage();
	
	if (answers.email.enabled) {
		console.log("\nIf setup worked fine, you will receive an Email notification in a few seconds.\n");
	}
	else {
		console.log("\nEmail notifications disabled.\n");
	}
	return answers;
}


module.exports = {
	ask
};
