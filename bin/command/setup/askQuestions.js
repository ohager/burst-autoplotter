let askQuestions = (() => {
	var _ref = _asyncToGenerator(function* (questions, options) {

		if (options.version) {
			return;
		}

		const answers = yield questions.ask(options);
		cache.update(answers, options.cache);

		if (isDevelopmentMode()) {
			console.debug(answers);
		}

		console.log(chalk`{greenBright Now, you may run the plotter using: 'autoplot run'}`);
	});

	return function askQuestions(_x, _x2) {
		return _ref.apply(this, arguments);
	};
})();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const cache = require("../../cache");
const chalk = require("chalk");
const { isDevelopmentMode } = require("../../utils");


module.exports = askQuestions;