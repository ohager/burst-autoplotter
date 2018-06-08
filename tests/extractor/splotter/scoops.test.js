const {
	getWritingScoops,
} = require('../../../src/extractor/splotter/scoops');

test("Test SPlotter getWritingScoops", () => {
	
	const input = "[CPU] N: 2048 (1138 nonces/min)                 [HDD] WS: 88.12% foo bar noise";
	const extracted = getWritingScoops(input);
	
	expect(extracted.$1).toBe('88.12');
	expect(extracted.$2).not.toBeDefined();
	
});
