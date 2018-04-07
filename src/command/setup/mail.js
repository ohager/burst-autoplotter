const cache = require("../../cache");
const questions = require("./mailQuestions");


function mailSetup(options){
	
	if(options.version){
		return;
	}
	
	questions.ask(options).then(answers => {
		
		
		/*
			email: {
		enabled : false,
		address: 'yourmail@mailer.com'
	},
	smtp: {
		host: 'smtp.mailtrap.io',
		port: 2525,
		secure: true,
		auth: {
			user: 'user',
			pass: 'password'
		}
	}
		 */
	
		
		
		//cache.update(answers, options.cache);
		
		console.log("Executing Mail Setup", answers);
	})
	
}

module.exports = mailSetup;