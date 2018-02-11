const {
	getValidationInfo,
} = require('../../src/extractor/validation');

test("Test getValidationInfo", () => {
	
	const input = "file: 12345678901234567890_7299739_4096_4096    checked - OK";
	const extracted = getValidationInfo(input);
	
	expect(extracted.$1).toBe('12345678901234567890_7299739_4096_4096');
	expect(extracted.$2).toBe('OK');
	expect(extracted.$3).not.toBeDefined();
	
});
