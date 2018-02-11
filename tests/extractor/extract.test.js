const extract = require('../../src/extractor/extract');

const FoxRegex = /The brown fox is (\d+) years old, and has (\w+) children/;

test("Test extract - matches", () => {
	
	const input = "The brown fox is 12 years old, and has six children";
	const extracted = extract(FoxRegex, input);
	
	expect(extracted.$1).toBe('12');
	expect(extracted.$2).toBe('six');
	
});

test("Test extract - no match", () => {
	
	const input = "The RED fox is 12 years old, and has six children";
	
	expect(extract(FoxRegex, input)).toBeNull();
	
});
