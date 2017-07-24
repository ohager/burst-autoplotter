const chalk = require('chalk');

// CPU: 4428 nonces done, (9011 nonces/min)
const WritingScoopsRegex = /scoops: (.+)%/g;
const NoncesPerMinRegex = /CPU: (\d+) nonces done, \((\d+) nonces\/min\).*scoops: (.+)%/g;


function getMatchedGroups(regex, str){
	const matches = regex.exec(str);
	if(!matches) return null;
	
	let groups = {};
	matches.forEach((match, groupIndex) => groups[`$${groupIndex}`] = match );
	return groups;
}

const getNoncesPerMin = input => getMatchedGroups(NoncesPerMinRegex, input);
const getWritingScoops = input => getMatchedGroups(WritingScoopsRegex, input);


let lastDone = 0;

const calcProgress = (context) => ( (1 -(context.totalRemainingNonces/context.totalNonces)) * 100.0).toFixed(2)

function prettifyNoncesPerMin(context,{$1 : done,$2 : perMin}){
	
	if(done < lastDone) lastDone = 0;
	
	context.totalRemainingNonces -= (+done - lastDone);
	
	const progress = calcProgress(context);

	process.stdout.clearLine();
	process.stdout.cursorTo(0);
	process.stdout.write(chalk`{greenBright [${progress}%]} @{yellowBright ${perMin} nonces/min} - ${context.totalRemainingNonces} remaining nonces - Current plot: {whiteBright ${done}/${context.currentPlotNonces}}`);

	lastDone = +done;
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

function _log(context, output){
	const text = output.toString();

	console.log(text);
	
	const npm = getNoncesPerMin(text);
	const scoops = getWritingScoops(text);
	
	if(npm) prettifyNoncesPerMin(context, npm);
	if(scoops) prettifyWritingScoops(context, scoops, !!npm);
}

function _error(output){
	const text = output.toString();
	
	console.log(chalk`{redBright DAMN!} - Something screwed up!`);
	console.log(chalk`{yellowBright ${text}}`)
}

module.exports = {
	log : _log,
	error : _error
};