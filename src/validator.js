const chalk = require('chalk');
const path = require('path');
const {spawnSync} = require('child_process');

const {PLOT_VALIDATOR} = require('./config');

const validator = path.join(__dirname, "../exe", PLOT_VALIDATOR);

const execValidator = function* (plot) {
	
	// PlotsChecker.exe c:\burst\plot
	const validatorArgs = [plot];
	
	yield new Promise(function (resolve, reject) {
		
		const validatorResult = spawnSync(validator, validatorArgs);
		
		//logValidator(validatorResult.stdout);
		
		if (validatorResult.status !== 0) {
			if (validatorResult.stderr) {
				error(validatorResult.stderr);
			}
			
			console.log(chalk`{redBright 😞 Doh!} - There is a problem with one or more plots.`);
			reject();
			return;
		}
		
		console.log(chalk`{greenBright 😊 Fine!} - Plot(s) seem(s) to be ok`);
		resolve();
	});
	
};

module.exports = execValidator;