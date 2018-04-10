const ask = require("./askQuestions");
const questions = require("./telegramQuestions");

module.exports = ask.bind(null, questions);