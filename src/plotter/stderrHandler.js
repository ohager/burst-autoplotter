
function handleData(output) {
	
	const text = output.toString();
	
	// TODO: better view!
	console.log(chalk`{redBright DAMN!} - Something screwed up!`);
	console.log(chalk`{yellowBright ${text}}`);
	
}

module.exports = handleData;