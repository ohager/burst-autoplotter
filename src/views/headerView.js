const chalk = require("chalk");
const {writeAtLine} = require("./viewUtils");
const {version, author} = require("../../package.json");

function render({
	                line,
	                threads,
	                memoryInMiB,
	                totalPlotSizeInGiB,
	                plotCount,
	                totalNonces,
					instructionSet
                }) {
	
	writeAtLine(line, chalk`{yellowBright BURST Autoplotter Version ${version} by ${author.name}} - Credits to Blago for XPlotter`);
	writeAtLine(++line, chalk`{yellowBright ${"-".repeat(50)}}`);
	writeAtLine(++line, chalk`Created partition for {whiteBright ${totalPlotSizeInGiB} GiB} in {whiteBright ${plotCount} chunk(s)}`);
	writeAtLine(++line, chalk`Overall nonces to be written: {whiteBright ${totalNonces}}`);
	writeAtLine(++line, chalk`Threads: {whiteBright ${threads}}`);
	writeAtLine(++line, chalk`Memory: {whiteBright ${memoryInMiB} MiB}`);
	writeAtLine(++line, chalk`Instruction Set: {whiteBright ${instructionSet}}`);
	writeAtLine(++line, chalk`{yellowBright ${"-".repeat(50)}}`);
	
	return line;
}

module.exports = {
	render
};