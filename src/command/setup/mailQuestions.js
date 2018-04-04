const {prompt} = require('inquirer');
const cache = require("../../cache");
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

function configQuestions(defaults, options, previousAnswers) {

	if(!previousAnswers.mailEnabled){
		return prompt([]); // no more questions
	}
	
	const defaultMail = defaults.email || {
		enabled : previousAnswers.mailEnabled,
		address : 'yourmail@mailer.com'
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
	
	return prompt(questions);
}

function ask(options) {
	
	const defaults = cache.load(options.cache);
	
	return startQuestions(defaults, options)
		.then(configQuestions.bind(null, defaults, options))
}


module.exports = {
	ask
};