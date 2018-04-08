const cache = require("../../cache");
const questions = require("./mailQuestions");
const chalk = require("chalk");

function mailSetup(options){
	
	if(options.version){
		return;
	}
	
	questions.ask(options).then(answers => {
		cache.update(answers, options.cache);
		console.log(chalk`{greenBright Now, you may run the plotter using: 'autoplot run'}`);
	})
	
}

module.exports = mailSetup;