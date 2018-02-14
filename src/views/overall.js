const chalk = require("chalk");
const {normalizeProgress} = require('../utils');
const progressBar = require("./progressBar");
const formatTimeString = require("../utils").formatTimeString;

/*
 
 0 OVERALL
 1 Elapsed Time: 00:12:34  - Started: 01-03-2-18 16:02:12
 2 Remaining Time: 01:23:45 - ETA: 01-03-2018 17:45:10
 3 [###########                                      ] 10000/50000 - 20%
 
 */

const cli = process.stdout;

function writeAtLine(line, text) {
	cli.cursorTo(0, line);
	cli.clearLine();
	cli.write(text);
}

function update({
	                started,
	                elapsed,
	                remaining,
	                eta,
	                totalNonces,
	                totalWrittenNonces
                }) {
		
	const remainingNonces = totalNonces - totalWrittenNonces;
	const percentage = ((totalWrittenNonces/totalNonces) * 100).toFixed(2);
	const progress = progressBar(0, totalNonces, totalWrittenNonces, 50);
	
	writeAtLine(0, chalk`Elapsed: {whiteBright ${formatTimeString(elapsed)}}`);
	writeAtLine(1, chalk`{green ${progress}} {whiteBright ${totalWrittenNonces}/${totalNonces} - ${percentage}%}`);
	
}

module.exports = {
	update
};