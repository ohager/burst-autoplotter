const store = require("../store");
const {extractors} = require("../extractor");

function handleStdout(output) {
	
	const text = output.toString();
	const lines = text.split("\r\n");
	
	const validatedPlots = lines
		.map(l => l.trim())
		.filter(l => l.length > 0)
		.map(l => {
			const groups = extractors.validation.getValidationInfo(l);
			return groups && {
				plot: groups.$1,
				isValid: groups.$2 === 'OK'
			};
		})
		.filter(vp => vp);
	
	store.update(() => ({
			validatedPlots
		})
	);
}

module.exports = handleStdout;