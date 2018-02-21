const chalk = require("chalk");
const {format} = require("date-fns");
const {writeAtLine} = require("./viewUtils");
const {formatTimeString} = require('../../utils');
const progressBar = require("./progressBarView");

/*
 
 0 OVERALL
 1 Elapsed Time: 00:12:34  - Started: 01-03-2-18 16:02:12
 2 Remaining Time: 01:23:45 - ETA: 01-03-2018 17:45:10
 3 [###########                                      ] 10000/50000 - 20%
 
*/
	function render({
		                line,
		                started,
		                elapsed,
		                remaining,
		                eta,
		                totalNonces,
		                totalWrittenNonces,
						noncesPerMinute
	                }) {
	
	const percentage = ((totalWrittenNonces / totalNonces) * 100).toFixed(2);
	const progress = progressBar(0, totalNonces, totalWrittenNonces, 50);
	const etaStr = eta ? format(eta, "DD-MM-YYYY HH:mm:ss") : "N/A";
	
	line++; // skip one line
	writeAtLine(++line, chalk`Elapsed: {whiteBright ${formatTimeString(elapsed)}} - Started: {whiteBright ${format(started, "DD-MM-YYYY HH:mm:ss")}}`);
	writeAtLine(++line, chalk`Remaining: {whiteBright ${formatTimeString(remaining)}} - ETA: {whiteBright ${etaStr}} - {yellow nonces/min: ${noncesPerMinute}}`);

	line++; // skip one line
	writeAtLine(++line, chalk`{greenBright ${progress}} {whiteBright ${totalWrittenNonces}/${totalNonces} - ${percentage}%}`);
	
	return line;
}

module.exports = {
	render
};