const commandLineArgs = require("command-line-args");
const commandRun = require("./run");
const commandSetup = require("./setup");
const printHeader = require("./header");
const {printUsage, printUnknownCommand, printUnknownOption} = require("./usage");

const VoidFunc = () => {};

function ifHelp(currentCommand, argv, optionList) {
	let options;
	try {
		options = commandLineArgs(optionList, {argv});
	} catch (e) {
		printUnknownOption(argv);
		options = {help: true};
	}
	
	if (options.help) {
		printUsage(currentCommand, optionList);
	}
	
	return {
		otherwise: options.help ? VoidFunc : fn => fn(options)
	}
}


const DefaultOptionList = [
	{name: 'cache', alias: 'c', type: String, description: "Set cache file", typeLabel: "<filename>"},
	{name: 'help', alias: 'h', type: Boolean, description: "Get help for current command",},
	{name: 'version', alias: 'v', type: Boolean, description: "Prints out version without plotter",},
];

function readCommand(argv) {
	const command = commandLineArgs([{name: 'name', defaultOption: true}], {argv, stopAtFirstUnknown: true});
	return {
		name: command.name,
		args: command._unknown || []
	}
}

function callCommand(command, handler) {
	const commandFn = handler[command.toLowerCase()];
	if (!commandFn) {
		printUnknownCommand(command, handler);
		return VoidFunc;
	}
	return commandFn;
}

const setupHandler = {
	mail: commandSetup.mail
};

const mainHandler = {
	run: onRunCommand,
	setup: onSetupCommand
};

function onRunCommand(argv) {
	
	const optionList = DefaultOptionList.concat([
		{name: 'extended', alias: 'e', type: Boolean, description: "Runs in extended mode with additional settings"}
	]);
	
	ifHelp('run', argv, optionList).otherwise(options => commandRun(options));
}

function onSetupCommand(argv) {
	const {name, args} = readCommand(argv);
	
	ifHelp('setup', argv, DefaultOptionList).otherwise(options => callCommand(name || 'mail', setupHandler)(args));

}


function start() {
	const {name, args} = readCommand();
	printHeader();
	callCommand(name || 'run', mainHandler)(args);
}

module.exports = {
	start,
};

