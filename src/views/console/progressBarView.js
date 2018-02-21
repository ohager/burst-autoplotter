const {normalizeProgress} = require("../../utils");

function progressBar(min, max, current, length, sign = '#') {
	let progress = normalizeProgress(min, max, current, length);
	
	// avoid overflows
	if(progress > length){
		progress = length;
	}
	
	const bar = `[${sign.repeat(progress)}${' '.repeat(length - progress)}]`;
	return bar==='[]' ? `[#INV:(${min},${max},${current},${length})]` : bar;
}

module.exports = progressBar;
