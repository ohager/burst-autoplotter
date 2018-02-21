const chalk = require("chalk");
const {writeLine,skipLine} = require("./viewUtils");

function renderSingleValidation({
	                plot,
	                isValid
                }) {
	
	if (isValid) {
		writeLine(chalk`{green [{greenBright ✔}]} {white Plot ${plot}}`);
	}
	else {
		writeLine(chalk`{redBright [{yellowBright 💥}] Plot ${plot}} (replot recommended)`);
	}
}

function render(validatedPlots){
	writeLine(chalk`{yellow ----------------- Validated Plots ----------------}`);
	validatedPlots.forEach(renderSingleValidation);
}

module.exports = {
	render
};