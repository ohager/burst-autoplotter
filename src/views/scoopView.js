const chalk = require("chalk");
const {normalizeProgress} = require('../utils');
const progressBar = require("./progressBarView");

/*

8 SCOOPS
9 [...........................................      ] 85%

*/

function writeAtLine(line, text) {
	const cli = process.stdout;
	cli.cursorTo(0, line);
	cli.clearLine();
	cli.write(text);
}

function render({
	                line,
	                isScooping,
	                percentage,
                }) {
	
	const progress = progressBar(0, 100, percentage, 50, ".");
	
	if(isScooping) {
		writeAtLine(line, chalk`Writing Scoops: {gray ${progress} ${percentage}%}`);
	}
	else{
		writeAtLine(line, "");
	}
	
	return ++line;
}

module.exports = {
	render
};