const cache = require("../../cache");
const chalk = require("chalk");
const {isDevelopmentMode} = require("../../utils");
async function askQuestions(questions, options){
	
	if(options.version){
		return;
	}
	
	const answers = await questions.ask(options);
	cache.update(answers, options.cache);
	
	if(isDevelopmentMode()){
		console.debug(answers);
	}
	
	console.log(chalk`{greenBright Now, you may run the plotter using: 'autoplot run'}`);
}

module.exports = askQuestions;
