const questions = require("./questions");

function run(options) {
	return questions.ask(options)
}

module.exports = run;