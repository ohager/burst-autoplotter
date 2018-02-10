const FACT_MIB = 1024 * 1024;
const FACT_GIB = FACT_MIB * 1024;

const _gib2b = gib => gib * FACT_GIB;
const _b2mib = noBytes => noBytes / FACT_MIB;
const _b2gib = noBytes => (noBytes / FACT_GIB);

function _formatTimeString(seconds) {
	if(seconds === null || seconds === undefined || typeof(seconds) !== 'number' ) return '??:??:??';
	
	const p = (n) => n<10 ? '0' + n : '' + n;
	
	const h = Math.floor(seconds/3600);
	const m = Math.floor((seconds%3600)/60);
	const s = seconds%60;
	
	return `${p(h)}:${p(m)}:${p(s)}`;
}

module.exports = {
	gib2b : _gib2b,
	b2gib : _b2gib,
	b2mib : _b2mib,
	formatTimeString : _formatTimeString
};