const chalk = require('chalk');

const WritingScoopsRegex = /scoops: (.+)%/g;
// CPU: 85% done, (9011 nonces/min)
const NoncesPerMinRegex = /CPU: (\d+)% done, \((\d+) nonces\/min\)/g;
// file: 12345678901234567890_7299739_4096_4096    checked - OK
const ValidatorRegex = /file: (\d+_\d+_\d+_\d+).*(OK)/;

function getMatchedGroups(regex, str) {
	const matches = regex.exec(str);
	if (!matches) {
		return null;
	}

	let groups = {};
	matches.forEach((match, groupIndex) => groups[`$${groupIndex}`] = match);
	return groups;
}

const getNoncesPerMin = input => getMatchedGroups(NoncesPerMinRegex, input);
const getWritingScoops = input => getMatchedGroups(WritingScoopsRegex, input);
const getValidationInfo = input => getMatchedGroups(ValidatorRegex, input);

let lastDone = 0;

const calcProgress = context => ((1 - context.totalRemainingNonces / context.totalNonces) * 100.0).toFixed(2);

function prettifyNoncesPerMin(context, { $1: donePercent, $2: perMin }) {

	const done = Math.min(context.currentPlotNonces, Math.floor(context.currentPlotNonces * (donePercent / 100.0)));

	if (done < lastDone) lastDone = 0;

	context.totalRemainingNonces -= +done - lastDone;

	const progress = calcProgress(context);

	process.stdout.clearLine();
	process.stdout.cursorTo(0);
	process.stdout.write(chalk`{greenBright [${progress}%]} @{yellowBright ${perMin} nonces/min} - ${context.totalRemainingNonces} remaining nonces - Current plot: {whiteBright ${done}/${context.currentPlotNonces}}`);

	lastDone = +done;
}

function prettifyWritingScoops(context, { $1: percent }, hasNoncesPerMin) {

	if (percent === '0.00') return;

	if (!hasNoncesPerMin) {
		const progress = calcProgress(context);
		process.stdout.clearLine();
		process.stdout.cursorTo(0);
		process.stdout.write(chalk`{greenBright [${progress}%]}`);
	}

	process.stdout.write(chalk` - Writing Scoops: {whiteBright ${percent}%}`);
}

function prettifyValidation({ $1: plotFile, $2: status }) {

	if (status === 'OK') {
		console.log(chalk`Checked plot {whiteBright ${plotFile}} - {green VALID!}`);
	} else {
		console.log(chalk`Checked plot {whiteBright ${plotFile}} - {redBright INVALID!}`);
	}
}

function _logPlotter(context, output) {
	const text = output.toString();

	const npm = getNoncesPerMin(text);
	const scoops = getWritingScoops(text);

	if (npm) prettifyNoncesPerMin(context, npm);
	if (scoops) prettifyWritingScoops(context, scoops, !!npm);
}

function _logPlotterEnd(context) {

	prettifyNoncesPerMin(context, { $1: 100, $2: 0 });
}

function _logValidator(output) {
	const text = output.toString();

	const lines = text.split("\r\n");
	let isValid = true;
	lines.forEach(line => {

		line = line.trim();
		if (!line.length) return;

		const validation = getValidationInfo(line);
		prettifyValidation(validation);

		if (!validation) {
			isValid = false;
		}
	});

	if (!isValid) {
		console.log(chalk`{redBright Gosh!} Found problems with scanned plots`);
		console.log(chalk`{whiteBright} Log:`);
		console.log(text);
	}
}

function _error(output) {
	const text = output.toString();

	console.log(chalk`{redBright DAMN!} - Something screwed up!`);
	console.log(chalk`{yellowBright ${text}}`);
}

module.exports = {
	logPlotter: _logPlotter,
	logPlotterEnd: _logPlotterEnd,
	logValidator: _logValidator,
	error: _error
};