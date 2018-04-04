const chalk = require('chalk');
const commandLineUsage = require('command-line-usage');

function printCommand(command) {
	console.log(chalk`{green o ${command}}`);
}



function printUnknownCommand(unknownCommand, handler){
	
	console.log("\n");
	console.log(chalk`{redBright Meh! Unknown Command} {yellowBright ${unknownCommand.toUpperCase()}}`);
	console.log("\n");
	console.log("Following commands are available:\n");
	Object.keys(handler).forEach(printCommand);
	console.log("\n");
	console.log(chalk`Use {whiteBright --help} option to know more about each command`);
	console.log("\n");
	
}

function printUnknownOption(unknownOption){
	
	console.log("\n");
	console.log(chalk`{redBright Meh! Unknown Option} {yellowBright ${unknownOption}}`);
	console.log("\n");
	
}

function printUsage(command, options){
	const usage = commandLineUsage([
		{
			header: 'BURST Auto Plotter Help',
			content: `Current Command: {whiteBright ${command.toUpperCase()}}`
		},
		{
			header: 'Options',
			optionList: options
		}
	]);
	console.log(usage)
}

module.exports = {
	printUsage,
	printUnknownCommand,
	printUnknownOption
};
