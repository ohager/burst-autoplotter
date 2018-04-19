const path = require('path');
const {spawnSync} = require('child_process');
const handleStdout = require("./stdoutHandler");
const {PLOT_VALIDATOR} = require('../config');

const validator = path.join(__dirname, "../../exe", PLOT_VALIDATOR);

async function execValidator(plot) {
	
	// PlotsChecker.exe c:\burst\plot
	const validatorArgs = [plot];
	
	return new Promise(resolve => {
		
		const validatorResult = spawnSync(validator, validatorArgs);
		
		// errors are written to std::cout in plotschecker, so handle all in stdout :/
		// https://github.com/Blagodarenko/PlotsChecker/blob/master/PlotsChecker.cpp#L123
		handleStdout(validatorResult.stdout);
		resolve();
	});
	
}

module.exports = execValidator;
