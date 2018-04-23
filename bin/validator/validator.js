let execValidator = (() => {
	var _ref = _asyncToGenerator(function* (plot) {

		// PlotsChecker.exe c:\burst\plot
		const validatorArgs = [plot];

		return new Promise(function (resolve) {

			const validatorResult = spawnSync(validator, validatorArgs);

			// errors are written to std::cout in plotschecker, so handle all in stdout :/
			// https://github.com/Blagodarenko/PlotsChecker/blob/master/PlotsChecker.cpp#L123
			handleStdout(validatorResult.stdout);
			resolve();
		});
	});

	return function execValidator(_x) {
		return _ref.apply(this, arguments);
	};
})();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const path = require('path');
const { spawnSync } = require('child_process');
const handleStdout = require("./stdoutHandler");
const { PLOT_VALIDATOR } = require('../config');

const validator = path.join(__dirname, "../../exe", PLOT_VALIDATOR);

module.exports = execValidator;