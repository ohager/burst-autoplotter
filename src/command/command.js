const commandLineArgs = require("command-line-args");
const commandRun = require("./run");
const commandSetup = require("./setup");
const printHeader = require("./header");
const {printUsage, printUnknownCommand, printUnknownOption} = require("./usage");

const VoidFunc = () => {
};

function ifHelp(currentCommand, options, optionList, commandList) {
	
	if (options.help) {
		printUsage(currentCommand, optionList, commandList);
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

function readOptions(optionList, argv) {
	let options;
	try {
		options = commandLineArgs(optionList, {argv});
	} catch (e) {
		printUnknownOption(argv);
		options = {help: true};
	}
	
	return options;
}

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
	mail: commandSetup.mail,
	telegram: commandSetup.telegram
};

const mainHandler = {
	run: onRunCommand,
	setup: onSetupCommand
};

function onRunCommand(argv) {
	
	const optionList = DefaultOptionList.concat([
		{name: 'extended', alias: 'e', type: Boolean, description: "Runs in extended mode with additional settings"}
	]);
	
	const options = readOptions(optionList, argv);
	ifHelp('run', options, optionList).otherwise(options => commandRun(options));
}

function onSetupCommand(argv) {
	const {name, args} = readCommand(argv);
	
	const options = readOptions(DefaultOptionList, args);
	
	ifHelp('setup', options, DefaultOptionList, [
		{name: 'mail', summary: 'Sets up mail for notification'},
		{name: 'telegram', summary: 'Sets up push notification for Telegram'},
	]).otherwise(() => callCommand(name || 'mail', setupHandler)(args));
	
}

function start() {
	const {name, args} = readCommand();
	printHeader();
	callCommand(name || 'run', mainHandler)(args);
}

module.exports = {
	start,
};

