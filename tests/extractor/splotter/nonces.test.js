const {
	tryGetNoncesPerMin,
} = require('../../../src/extractor/splotter/nonces');

test("Test SPlotter getNoncesPerMin", () => {
	
	const input = "[CPU] N: 4428 (9011 nonces/min) - foo bar noise";
	const extracted = tryGetNoncesPerMin(input);
	
	expect(extracted.$1).toBe('4428');
	expect(extracted.$2).toBe('9011');
	expect(extracted.$3).not.toBeDefined();
	
});
