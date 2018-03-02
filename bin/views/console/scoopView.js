const chalk = require("chalk");
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
	percentage
}) {

	const progress = progressBar(0, 100, percentage, 50, ".");

	if (percentage !== 0) {
		writeAtLine(line, chalk`{white Writing Scoops: ${progress} ${percentage}%}`);
	} else {
		writeAtLine(line, chalk`{gray Writing Scoops: ${progress} ${percentage}%}`);
	}

	return ++line;
}

module.exports = {
	render
};