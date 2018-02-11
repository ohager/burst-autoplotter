const {
	getWritingScoops,
} = require('../../src/extractor/writingScoops');

test("Test getWritingScoops", () => {
	
	const input = "CPU: 4428 nonces done, (9011 nonces/min) - foo bar noise scoops: 88.12% bauadboa";
	const extracted = getWritingScoops(input);
	
	expect(extracted.$1).toBe('88.12');
	expect(extracted.$2).not.toBeDefined();
	
});
