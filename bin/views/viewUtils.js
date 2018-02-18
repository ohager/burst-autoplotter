const cli = process.stdout;

function writeAtLine(line, text) {
	cli.cursorTo(0, line);
	cli.clearLine();
	cli.write(text);
}

function writeLine(text) {
	cli.moveCursor(0, 1);
	cli.cursorTo(0);
	cli.write(text);
}

function skipLine(skipCount = 1) {
	cli.moveCursor(0, skipCount);
	cli.cursorTo(0);
}

module.exports = {
	writeAtLine,
	writeLine,
	skipLine
};