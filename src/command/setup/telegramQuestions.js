const {prompt} = require('inquirer');
const cache = require("../../cache");
const notification = require("../../notification");

function startQuestions(defaults, options) {
	const questions = [{
		type: "confirm",
		name: "telegramEnabled",
		message: "Do you want to send Telegram push notification (using MiddlemanBot)?",
		default: (defaults.telegram && defaults.telegram.enabled) || false,
	}];
	
	return prompt(questions)
}

function configQuestions(defaults, options, previousAnswers) {
	
	const uuidV4Regex = /^[A-F\d]{8}-[A-F\d]{4}-4[A-F\d]{3}-[89AB][A-F\d]{3}-[A-F\d]{12}$/i;
	
	if (!previousAnswers.telegramEnabled) {
		return prompt([]); // no more questions
	}
	
	const defaultTelegram = defaults.telegram || {
		enabled: previousAnswers.telegramEnabled,
		token: 'xxxxxxxx-xxxx-4xxx-xxxx-xxxxxxxxxxxx'
	};
	
	const questions = [
		{
			type: "input",
			name: "token",
			message: "What is your MiddlemanBot token?",
			validate: token => {
				return uuidV4Regex.test(token) ? true : "Sorry, but the Telegram Token must be an UUID"
			},
			default: defaultTelegram.token
		}
	];
	
	return prompt(questions).then(answers => ({...previousAnswers, ...answers}));
}

function mapAnswers(defaults, options, answers) {
	
	const _default = (section, field) => section && section[field];
	
	return {
		telegram: {
			enabled: !!answers.telegramEnabled,
			token: answers.token || _default(defaults.telegram, 'token')
		}
	};
}

function ask(options) {
	
	const defaults = cache.load(options.cache);
	
	return startQuestions(defaults, options)
		.then(configQuestions.bind(null, defaults, options))
		.then(mapAnswers.bind(null, defaults, options))
		.then(answers => {
			cache.update(answers, options.cache);
			
			notification.sendTelegramSetupSuccessMessage();
			console.log("\nIf setup worked fine, you will receive a Telegram notification in a few seconds.\n");
			
			return answers;
		})
}


module.exports = {
	ask
};