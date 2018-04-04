const {prompt} = require('inquirer');
const emailValidator = require("email-validator");
const cache = require("../../cache");

function mailQuestions(defaults, options) {
	
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
	
	return prompt(questions);
}



function mailSetup(options){
	const defaults = cache.load(options.cache);
	
	console.log("Executing Mail Setup", options);
}

module.exports = mailSetup;