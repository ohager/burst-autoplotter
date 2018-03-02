
const FACT_MIB = 1024 * 1024;
const FACT_GIB = FACT_MIB * 1024;

const gib2b = gib => gib * FACT_GIB;
const b2mib = noBytes => noBytes / FACT_MIB;
const b2gib = noBytes => noBytes / FACT_GIB;

function formatTimeString(seconds) {

	if (seconds === null || seconds === undefined || typeof seconds !== 'number') return 'N/A';

	const p = n => n < 10 ? '0' + n : '' + n;

	const h = Math.floor(seconds / 3600);
	const m = Math.floor(seconds % 3600 / 60);
	const s = seconds % 60;

	return `${p(h)}:${p(m)}:${p(s)}`;
}


function normalizeProgress(min, max, current, target) {
	if (max === min) return 0;
	return Math.floor((Math.min(current, max) - min) / (max - min) * target + min);
}

module.exports = {
	gib2b,
	b2gib,
	b2mib,
	formatTimeString,
	formatDateTime,
	normalizeProgress
};