const chalk = require("chalk");
const { formatTimeString } = require("../utils");
const { format } = require("date-fns");
const { writeLine, skipLine } = require("./viewUtils");
const validatorView = require("./validatorView");

function render({
	outputPath,
	totalWrittenNonces,
	totalPlots,
	noncesPerMinute,
	elapsedTimeSecs,
	validatedPlots
}) {

	skipLine();
	validatorView.render(validatedPlots);
	writeLine(chalk`{greenBright ${"=".repeat(50)}}`);
	writeLine(chalk`End Time: {whiteBright ${format(Date.now(), "DD-MM-YYYY HH:mm:ss")}}`);
	writeLine(chalk`Overall duration: {whiteBright ${formatTimeString(elapsedTimeSecs)}}`);
	writeLine(chalk`Plots written to: {whiteBright ${outputPath}}`);
	writeLine(chalk`Created Plots: {whiteBright ${totalPlots}}`);
	writeLine(chalk`Written Nonces: {whiteBright ${totalWrittenNonces}}`);
	writeLine(chalk`Effective Nonces/min: {whiteBright ${noncesPerMinute}}`);
	skipLine(2);
}

module.exports = {
	render
};