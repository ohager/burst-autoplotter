const ask = require("./askQuestions");
const questions = require("./mailQuestions");

module.exports = ask.bind(null, questions);