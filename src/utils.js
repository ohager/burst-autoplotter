/**
 * Created by Dextra on 7/10/2017.
 */

const FACT_MIB = 1024 * 1024;
const FACT_GIB = FACT_MIB * 1024;

const _gib2b = gib => gib * FACT_GIB;
const _b2mib = noBytes => noBytes / FACT_MIB;
const _b2gib = noBytes => (noBytes / FACT_GIB);

module.exports = {
	gib2b : _gib2b,
	b2gib : _b2gib,
	b2mib : _b2mib,
};