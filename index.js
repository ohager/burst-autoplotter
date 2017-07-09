const commandLineArgs = require('command-line-args');

const setup = require("./src/setup-ui");
const cacheHandler = require("./src/cache-handler");

const optionDefinitions = [
	{name: 'cache', alias: 'c', type: String},
];

const options = commandLineArgs(optionDefinitions);

const cache = cacheHandler.load(options.cache);

setup.run(cache).then(answers => {
	cacheHandler.update(cache, answers, options.cache);
});

