var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

let configQuestions = (() => {
	var _ref = _asyncToGenerator(function* (defaults, options, previousAnswers) {

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

		const questions = [{
			type: "input",
			name: "email",
			message: "What's your email address?",
			validate: function (email) {
				return emailValidator.validate(email) ? true : "I need a valid email address, man!";
			},
			default: defaultMail.address
		}, {
			type: "input",
			name: "host",
			message: "Enter the SMTP host",
			default: defaultSmtp.host
		}, {
			type: "input",
			name: "port",
			message: "Enter the hosts port",
			validate: function (port) {
				return (/^\d{3,4}$/.test(port) ? true : "Port must be a number!"
				);
			},
			default: defaultSmtp.port
		}, {
			type: "confirm",
			name: "secure",
			message: "Does it use TLS/SSL",
			default: defaultSmtp.secure
		}, {
			type: "input",
			name: "user",
			message: "SMTP Account User",
			default: defaultSmtp.auth.user
		}, {
			type: "input",
			name: "pass",
			message: "SMTP Account Password",
			default: defaultSmtp.auth.pass
		}];

		const answers = yield prompt(questions);
		return _extends({}, previousAnswers, answers);
	});

	return function configQuestions(_x, _x2, _x3) {
		return _ref.apply(this, arguments);
	};
})();

let ask = (() => {
	var _ref2 = _asyncToGenerator(function* (options) {

		const defaults = cache.load(options.cache);

		let answers = yield startQuestions(defaults, options);
		answers = yield configQuestions(defaults, options, answers);
		answers = yield mapAnswers(defaults, options, answers);

		cache.update(answers, options.cache);

		yield notification.sendMailSetupSuccessMessage();

		if (answers.email.enabled) {
			console.log("\nIf setup worked fine, you will receive an Email notification in a few seconds.\n");
		} else {
			console.log("\nEmail notifications disabled.\n");
		}
		return answers;
	});

	return function ask(_x4) {
		return _ref2.apply(this, arguments);
	};
})();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const { prompt } = require('inquirer');
const cache = require("../../cache");
const notification = require("../../notification");
const emailValidator = require("email-validator");

function startQuestions(defaults, options) {
	const questions = [{
		type: "confirm",
		name: "mailEnabled",
		message: "Do you want to send email notification?",
		default: defaults.email && defaults.email.enabled || false
	}];

	return prompt(questions);
}

function mapAnswers(defaults, options, answers) {

	const _default = (section, field) => section && section[field];

	return {
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
				pass: answers.pass || _default(defaults.smtp.auth, 'pass')
			}
		}
	};
}

module.exports = {
	ask
};