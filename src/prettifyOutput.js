const chalk = require('chalk');

// Output formatter for XPlotter

// CPU: 4428 nonces done, (9011 nonces/min)
const NoncesPerMinRegex = /CPU: (\d+) nonces done, \((\d+) nonces\/min\)/g;

// [99%] Generating nonces from 40914 to 40954:
const ProgressPercentRegex = /\[(\d+)%\] Generating nonces from (\d+) to (\d+)/g;

function getMatchedGroups(regex, str){
	const matches = regex.exec(str);
	if(!matches) return null;
	
	let groups = {};
	matches.forEach((match, groupIndex) => groups[`$${groupIndex}`] = match );
	return groups;
}

const getNoncesPerMin = input => getMatchedGroups(NoncesPerMinRegex, input);
const getProgress = input => getMatchedGroups(ProgressPercentRegex, input);

function prettifyNoncesPerMin({$1 : done,$2 : perMin}){
	console.log(chalk`{yellow ${perMin} nonces/min} - ${done} nonces done`);
}

function prettifyProgress({$1:progress,$2:from,$3:to}){
	console.log(chalk`Progress: {green ${progress}%}`);
}

module.exports = function(data){
	
	const npm = getNoncesPerMin(data);
	const progress = getProgress(data);

	if(npm) prettifyNoncesPerMin(npm);
	if(progress) prettifyProgress(progress);
};