const {
	tryGetNoncesPerMin,
} = require('../../../src/extractor/xplotter/sse');

test("Test XPlotter SSE getNoncesPerMin", () => {
	
	const input = "CPU: 4428 nonces done, (9011 nonces/min) - foo bar noise";
	const extracted = tryGetNoncesPerMin(input);
	
	expect(extracted.$1).toBe('4428');
	expect(extracted.$2).toBe('9011');
	expect(extracted.$3).not.toBeDefined();
	
});
