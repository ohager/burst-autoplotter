var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

let startQuestions = (() => {
	var _ref = _asyncToGenerator(function* (defaults, options) {
		const questions = [{
			type: "confirm",
			name: "telegramEnabled",
			message: "Do you want to send Telegram push notification (using MiddlemanBot)?",
			default: defaults.telegram && defaults.telegram.enabled || false
		}];

		return prompt(questions);
	});

	return function startQuestions(_x, _x2) {
		return _ref.apply(this, arguments);
	};
})();

let configQuestions = (() => {
	var _ref2 = _asyncToGenerator(function* (defaults, options, previousAnswers) {

		const uuidV4Regex = /^[A-F\d]{8}-[A-F\d]{4}-4[A-F\d]{3}-[89AB][A-F\d]{3}-[A-F\d]{12}$/i;

		if (!previousAnswers.telegramEnabled) {
			return prompt([]); // no more questions
		}

		const defaultTelegram = defaults.telegram || {
			enabled: previousAnswers.telegramEnabled,
			token: 'xxxxxxxx-xxxx-4xxx-xxxx-xxxxxxxxxxxx'
		};

		const questions = [{
			type: "input",
			name: "token",
			message: "What is your MiddlemanBot token?",
			validate: function (token) {
				return uuidV4Regex.test(token) ? true : "Sorry, but the Telegram Token must be an UUID";
			},
			default: defaultTelegram.token
		}];

		const answers = yield prompt(questions);
		return _extends({}, previousAnswers, answers);
	});

	return function configQuestions(_x3, _x4, _x5) {
		return _ref2.apply(this, arguments);
	};
})();

let ask = (() => {
	var _ref3 = _asyncToGenerator(function* (options) {

		const defaults = cache.load(options.cache);

		let answers = yield startQuestions(defaults, options);
		answers = yield configQuestions(defaults, options, answers);
		answers = yield mapAnswers(defaults, options, answers);

		cache.update(answers, options.cache);

		yield notification.sendTelegramSetupSuccessMessage();

		if (answers.telegram.enabled) {
			console.log("\nIf setup worked fine, you will receive a Telegram notification in a few seconds.\n");
		} else {
			console.log("\nTelegram notifications disabled.\n");
		}
		return answers;
	});

	return function ask(_x6) {
		return _ref3.apply(this, arguments);
	};
})();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const { prompt } = require('inquirer');
const cache = require("../../cache");
const notification = require("../../notification");

function mapAnswers(defaults, options, answers) {

	const _default = (section, field) => section && section[field];

	return _extends({}, defaults, {
		telegram: {
			enabled: !!answers.telegramEnabled,
			token: answers.token || _default(defaults.telegram, 'token')
		}
	});
}

module.exports = {
	ask
};