const {prompt} = require('inquirer');
const cache = require("../../cache");
const notification = require("../../notification");

async function startQuestions(defaults, options) {
	const questions = [{
		type: "confirm",
		name: "telegramEnabled",
		message: "Do you want to send Telegram push notification (using MiddlemanBot)?",
		default: (defaults.telegram && defaults.telegram.enabled) || false,
	}];
	
	return prompt(questions)
}

async function configQuestions(defaults, options, previousAnswers) {
	
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
	
	const answers = await prompt(questions);
	return {...previousAnswers, ...answers};
}

function mapAnswers(defaults, options, answers) {
	
	const _default = (section, field) => section && section[field];
	
	return {
		...defaults,
		telegram: {
			enabled: !!answers.telegramEnabled,
			token: answers.token || _default(defaults.telegram, 'token')
		}
	};
}

async function ask(options) {
	
	const defaults = cache.load(options.cache);
	
	let answers = await startQuestions(defaults, options);
	answers = await configQuestions(defaults, options, answers);
	answers = await mapAnswers(defaults, options, answers);
	
	cache.update(answers, options.cache);
	
	await notification.sendTelegramSetupSuccessMessage();
	
	if (answers.telegram.enabled) {
		console.log("\nIf setup worked fine, you will receive a Telegram notification in a few seconds.\n");
	}
	else {
		console.log("\nTelegram notifications disabled.\n");
	}
	return answers;
}


module.exports = {
	ask
};
