const {addSeconds, format} = require("date-fns");
const chalk = require('chalk');
const {formatTimeString} = require("./utils");
const store = require("./store");
const {avx, sse, validation, writingScoops} = require("./extractor");

const isAVX = ({instructionSet}) => instructionSet.indexOf('AVX') !== -1;


let lastDone = 0;

let noncesPerSecondsBuffer = [];
let cycleCount = 0;
let lastCycleStart = 0;

const calcProgress = (context) => ( (1 -(context.totalRemainingNonces/context.totalNonces)) * 100.0).toFixed(2);

const calcAvgNoncesPerSecond = (written, elapsedSeconds) => {
	noncesPerSecondsBuffer[cycleCount%10] = Math.round(written/elapsedSeconds);
	++cycleCount;
	return noncesPerSecondsBuffer.reduce((p,c) => p+c, 0)/noncesPerSecondsBuffer.length;
};

const calcRemainingDuration = (context,written) => {
	
	if(lastCycleStart === 0) lastCycleStart = context.startTime;
	
	const now = Date.now();
	const elapsedSeconds = (now - lastCycleStart)/1000;
	lastCycleStart = now;
	
	if(elapsedSeconds < 0.00001) return null;

	const avgNonceSpeed = calcAvgNoncesPerSecond(written, elapsedSeconds);
	if (avgNonceSpeed < 0.00001 ) return null;
	
	return Math.round(context.totalRemainingNonces/avgNonceSpeed);
};


function prettifyNoncesPerMin(context,{$1 : done,$2 : perMin}){
	
	if(done < lastDone) {
		lastDone = 0;
	}
	
	const writtenNonces = (+done - lastDone);
	lastDone = +done;
	context.totalRemainingNonces -= writtenNonces;
	
	const progress = calcProgress(context, writtenNonces);
	const remainingDuration = calcRemainingDuration(context,writtenNonces);
	const eta = addSeconds(new Date(), remainingDuration);
	
	process.stdout.clearLine();
	process.stdout.cursorTo(0);
	process.stdout.write(chalk`Remaining time: {whiteBright ${formatTimeString(remainingDuration)}} - ETA: {whiteBright ${format(eta, 'DD-MM-YYYY hh:mm:ss')}}`);
	process.stdout.moveCursor(0,1);
	process.stdout.cursorTo(0);
	process.stdout.clearLine();
	process.stdout.write(chalk`{greenBright [${progress}%]} @{yellowBright ${perMin} nonces/min} - ${context.totalRemainingNonces} remaining nonces - Current plot: {whiteBright ${done}/${context.currentPlotNonces}}`);
	process.stdout.moveCursor(0,-1);
	process.stdout.cursorTo(0);
	
}

function prettifyWritingScoops(context, {$1: percent}, hasNoncesPerMin){
	
	if(percent === '0.00') return;
	
	if(!hasNoncesPerMin){
		const progress = calcProgress(context);
		process.stdout.clearLine();
		process.stdout.cursorTo(0);
		process.stdout.write(chalk`{greenBright [${progress}%]}`)
	}
	
	process.stdout.write(chalk` - Writing Scoops: {whiteBright ${percent}%}`);
}

function prettifyValidation({$1: plotFile, $2: status} ){
	
	if(status === 'OK'){
		console.log(chalk`Checked plot {whiteBright ${plotFile}} - {green VALID!}`);
	}
	else{
		console.log(chalk`Checked plot {whiteBright ${plotFile}} - {redBright INVALID!}`);
	}
}


// move to context, to be considered by multifile plots!


function _logPlotter(context, output){
	const text = output.toString();

	store.update(() => ({
		text
	}));
	
	let ctxavx = context.avx;
	let npm = null;
	if(isAVX(context)){
		
		const currentNonceChunk = avx.getNoncesChunkedRange(text);
		
		if(currentNonceChunk) {
			ctxavx = {
				...ctxavx,
				chunkPercentage: 0.0,
				chunkStart: +currentNonceChunk.$1,
				chunkEnd: +currentNonceChunk.$2
			}
		}
		const currentChunkPercentage = avx.getCurrentChunkPercentage(text);
		if(currentChunkPercentage){
			ctxavx = {
				...ctxavx,
				chunkPercentage: (+currentChunkPercentage.$1)/100,
			};
		}
		const donePerChunk = Math.floor(((ctxavx.chunkEnd - ctxavx.chunkStart) * ctxavx.chunkPercentage));
		if(donePerChunk<ctxavx.lastDoneBuffer) ctxavx.lastDoneBuffer = 0;
		ctxavx.done += (donePerChunk - ctxavx.lastDoneBuffer);
		ctxavx.lastDoneBuffer = donePerChunk;
		
		npm = {
			$1: ctxavx.done,
			$2: currentChunkPercentage ? currentChunkPercentage.$2 : "???"
		};
		
		context.avx = ctxavx;
	}
	else {
		npm = sse.getNoncesPerMin(text);
	}
	const scoops = writingScoops.getWritingScoops(text);
	
	if(npm) prettifyNoncesPerMin(context, npm);
	if(scoops) prettifyWritingScoops(context, scoops, !!npm);
}

function _logPlotterEnd(context){
	prettifyNoncesPerMin(context, {$1:context.currentPlotNonces, $2:0});
	process.stdout.moveCursor(0,2);
	process.stdout.clearLine();
}


function _logValidator(output) {
	const text = output.toString();
	
	const lines = text.split("\r\n");
	let isValid = true;
	lines.forEach( line => {

		line = line.trim();
		if(!line.length ) return;

		const validation = validation.getValidationInfo(line);
		prettifyValidation(validation);

		if(!validation){
			isValid = false;
		}
	});
	
	if(!isValid){
		console.log(chalk`{redBright Gosh!} Found problems with scanned plots`);
		console.log(chalk`{whiteBright} Log:`);
		console.log(text);
	}
	
}

function _error(output){
	const text = output.toString();
	
	console.log(chalk`{redBright DAMN!} - Something screwed up!`);
	console.log(chalk`{yellowBright ${text}}`)
}

module.exports = {
	logPlotter : _logPlotter,
	logPlotterEnd : _logPlotterEnd,
	logValidator : _logValidator,
	error : _error
};