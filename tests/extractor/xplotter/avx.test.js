const {
	tryGetCurrentChunkPercentage,
	tryGetNoncesChunkedRange,
} = require('../../../src/extractor/xplotter/avx');

test("Test XPlotter AVX getNoncesChunkedRange", () => {
	
	const input = "[85%] Generating nonces from 888635 to 930229 some noise";
	const extracted = tryGetNoncesChunkedRange(input);
	
	expect(extracted.$1).toBe('888635');
	expect(extracted.$2).toBe('930229');
	expect(extracted.$3).not.toBeDefined();
	
});

test("Test getCurrentChunkPercentage", () => {
	
	const input = "CPU: 85% done, (9011 nonces/min) more noise here";
	const extracted = tryGetCurrentChunkPercentage(input);
	
	expect(extracted.$1).toBe('85');
	expect(extracted.$2).toBe('9011');
	expect(extracted.$3).not.toBeDefined();
	
});
