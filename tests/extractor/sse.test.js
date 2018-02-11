const {
	getNoncesPerMin,
} = require('../../src/extractor/sse');

test("Test getNoncesPerMin", () => {
	
	const input = "CPU: 4428 nonces done, (9011 nonces/min) - foo bar noise";
	const extracted = getNoncesPerMin(input);
	
	expect(extracted.$1).toBe('4428');
	expect(extracted.$2).toBe('9011');
	expect(extracted.$3).not.toBeDefined();
	
});
