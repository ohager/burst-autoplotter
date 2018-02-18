const chalk = require("chalk");
const {writeLine, skipLine} = require("./viewUtils");

function render({error}) {
	
	skipLine(2);
	writeLine(chalk`{redBright ${"=".repeat(50)}}`);
	writeLine(chalk`{redBright Error: }{whiteBright ${error}}`);
	writeLine(chalk`{redBright 😭 Oh no! - Plotting failed }`);

}

module.exports = {
	render
};