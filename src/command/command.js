const commandLineArgs = require("command-line-args");
const commandRun = require("./run");
const commandSetup = require("./setup");

function readCommand(argv) {
	const command = commandLineArgs([{name: 'name', defaultOption: true}],{argv, stopAtFirstUnknown: true});
	return {
		name : command.name,
		args : command._unknown || []
	}
}

function usage(handler) {
	console.info("Following commands are available:\n");
	Object.keys(handler).forEach( command => console.info(command) );
}

function callCommand(command, handler){
	const commandFn = handler[command.toLowerCase()];
	if(!commandFn){
		
		console.error(`Unknown command '${command}'`);
		usage(handler);
		
		return () => {};
	}
	return commandFn;
}

const setupHandler = {
	mail : commandSetup.mail
};

function handleSetupCommand(arguments) {
	const {name, args} = readCommand(arguments);
	callCommand(name || 'mail', setupHandler)(args);
}

function handleRunCommand(argv){
	
	const options = commandLineArgs([
		{name: 'cache', alias: 'c', type: String},
		{name: 'extended', alias: 'e', type: Boolean},
	], {argv});
	
	commandRun(options);
}

const mainHandler = {
	run : handleRunCommand,
	setup: handleSetupCommand
};

function start() {
	const {name, args} = readCommand();
	callCommand(name || 'run', mainHandler)(args);
}

module.exports = {
	start,
};

