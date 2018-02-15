const chalk = require("chalk");
const {version} = require("../../package.json");
const {format} = require("date-fns");
const {normalizeProgress, formatTimeString} = require('../utils');
const progressBar = require("./progressBar");

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
	
	writeAtLine(0, chalk`{yellowBright BURST Autoplotter Version ${version} by ohager} - Credits to Blago for XPlotter`);
	writeAtLine(1, chalk`Elapsed: {whiteBright ${formatTimeString(elapsed)}} - Started: {whiteBright ${format(started, "DD-MM-YYYY HH:mm:ss")}}`);
	writeAtLine(2, chalk`{green ${progress}} {whiteBright ${totalWrittenNonces}/${totalNonces} - ${percentage}%}`);
	
}

module.exports = {
	update
};