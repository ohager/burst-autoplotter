const { addSeconds, format } = require("date-fns");
const chalk = require('chalk');
const { formatTimeString } = require("./utils");

const WritingScoopsRegex = /scoops: (.+)%/g;

// CPU: 4428 nonces done, (9011 nonces/min)
const NoncesPerMinRegex = /CPU: (\d+) nonces done, \((\d+) nonces\/min\).*scoops: (.+)%/g;
// CPU: 85% done, (9011 nonces/min) - output for AVX2 exec (blame Blago for that)
const NoncesPerMinDonePercentageRegex = /CPU: (\d+)% done, \((\d+) nonces\/min\)/g;
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

const isAVX = ({ instructionSet }) => instructionSet.indexOf('AVX') !== -1;

const getNoncesPerMin = input => getMatchedGroups(NoncesPerMinRegex, input);
const getNoncesPerMinForAVX = (context, input) => {
	let groups = getMatchedGroups(NoncesPerMinDonePercentageRegex, input);
	if (!groups) return null;

	// currently, the avx2 plotter has a percent based output, which differs from others instruction set output
	// so, it's necessary to calculate done nonces based on percentage
	const done = groups.$1;
	groups.$1 = Math.min(context.currentPlotNonces, Math.floor(context.currentPlotNonces * (done / 100.0)));
	return groups;
};
const getWritingScoops = input => getMatchedGroups(WritingScoopsRegex, input);
const getValidationInfo = input => getMatchedGroups(ValidatorRegex, input);

let lastDone = 0;

let noncesPerSecondsBuffer = [];
let cycleCount = 0;
let lastCycleStart = 0;

const calcProgress = context => ((1 - context.totalRemainingNonces / context.totalNonces) * 100.0).toFixed(2);

const calcAvgNoncesPerSecond = (written, elapsedSeconds) => {
	noncesPerSecondsBuffer[cycleCount % 10] = Math.round(written / elapsedSeconds);
	++cycleCount;
	return noncesPerSecondsBuffer.reduce((p, c) => p + c, 0) / noncesPerSecondsBuffer.length;
};

const calcRemainingDuration = (context, written) => {

	if (lastCycleStart === 0) lastCycleStart = context.startTime;

	const now = Date.now();
	const elapsedSeconds = (now - lastCycleStart) / 1000;
	lastCycleStart = now;

	if (elapsedSeconds < 0.00001) return null;

	const avgNonceSpeed = calcAvgNoncesPerSecond(written, elapsedSeconds);
	if (avgNonceSpeed < 0.00001) return null;

	return Math.round(context.totalRemainingNonces / avgNonceSpeed);
};

function prettifyNoncesPerMin(context, { $1: done, $2: perMin }) {

	if (done < lastDone) {
		lastDone = 0;
	}

	const writtenNonces = +done - lastDone;
	lastDone = +done;
	context.totalRemainingNonces -= writtenNonces;

	const progress = calcProgress(context, writtenNonces);
	const remainingDuration = calcRemainingDuration(context, writtenNonces);
	const eta = addSeconds(new Date(), remainingDuration);

	process.stdout.clearLine();
	process.stdout.cursorTo(0);
	process.stdout.write(chalk`Remaining time: {whiteBright ${formatTimeString(remainingDuration)}} - ETA: {whiteBright ${format(eta, 'DD-MM-YYYY hh:mm:ss')}}`);
	process.stdout.moveCursor(0, 1);
	process.stdout.cursorTo(0);
	process.stdout.clearLine();
	process.stdout.write(chalk`{greenBright [${progress}%]} @{yellowBright ${perMin} nonces/min} - ${context.totalRemainingNonces} remaining nonces - Current plot: {whiteBright ${done}/${context.currentPlotNonces}}`);
	process.stdout.moveCursor(0, -1);
	process.stdout.cursorTo(0);
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

	const npm = isAVX(context) ? getNoncesPerMinForAVX(context, text) : getNoncesPerMin(text);
	const scoops = getWritingScoops(text);

	if (npm) prettifyNoncesPerMin(context, npm);
	if (scoops) prettifyWritingScoops(context, scoops, !!npm);
}

function _logPlotterEnd(context) {
	prettifyNoncesPerMin(context, { $1: context.currentPlotNonces, $2: 0 });
	process.stdout.moveCursor(0, 2);
	process.stdout.clearLine();
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