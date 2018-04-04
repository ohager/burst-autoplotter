const cache = require("../../cache");
const questions = require("./mailQuestions");

function mailSetup(options){
	
	if(options.version){
		return;
	}
	
	questions.ask(options).then(answers => {
		
		//cache.update(answers, options.cache);
		
		console.log("Executing Mail Setup", answers);
	})
	
}

module.exports = mailSetup;