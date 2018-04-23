const chalk = require('chalk');
const {version, repository} = require('../../package.json');
const {hasAdminPrivileges} = require('../privilege');
const {isDevelopmentMode} = require('../utils');

function header(){
	
	console.log(chalk`{whiteBright --------------------------------------------------}`);
	console.log(chalk`{blueBright.bold BURST Auto Plotter} based on XPlotter`);
	console.log(chalk`Version {whiteBright ${version}}`);
	console.log(`\n`);
	console.log(chalk`{blueBright ${repository.url}}`);
	console.log(chalk`{whiteBright --------------------------------------------------}`);
	
	if (!isDevelopmentMode() && !hasAdminPrivileges()) {
		console.log('\n');
		console.log(chalk`{redBright No Admin rights!}`);
		console.log('You need to run Auto Plotter as administrator');
		process.exit(666);
	}

}


module.exports = header;
