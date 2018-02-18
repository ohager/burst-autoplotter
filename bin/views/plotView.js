const chalk = require("chalk");
const { format } = require("date-fns");
const { writeAtLine } = require("./viewUtils");
const { formatTimeString } = require('../utils');
const progressBar = require("./progressBarView");

/*
 
5 PLOT 1/5 Remaining Time: 00:12:34 - ETA: 01-03-2018 16:23:10
6 [*****************************                    ] 5000/10000 - 50%

*/

function render({
	line,
	plotIndex,
	plotCount,
	remaining,
	eta,
	nonces,
	writtenNonces
}) {

	const percentage = (writtenNonces / nonces * 100).toFixed(2);
	const progress = progressBar(0, nonces, writtenNonces, 50, "o");
	const etaStr = eta ? format(eta, "DD-MM-YYYY HH:mm:ss") : "N/A";
	writeAtLine(line, chalk`Plot {whiteBright ${plotIndex}/${plotCount}} - Remaining: {whiteBright ${formatTimeString(remaining)}} - ETA: {whiteBright ${etaStr}}`);
	writeAtLine(++line, chalk`{green ${progress}} {whiteBright ${writtenNonces}/${nonces} - ${percentage}%}`);

	return line;
}

module.exports = {
	render
};