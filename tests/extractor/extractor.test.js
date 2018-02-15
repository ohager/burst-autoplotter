const extractFromString = require('../../src/extractor/extract');
const extract = require('../../src/extractor').extract;

const FoxRegex = /The brown fox is (\d+) years old, and has (\w+) children/;

test("Test extract - matches", () => {
	
	const input = "The brown fox is 12 years old, and has six children";
	const extracted = extractFromString(FoxRegex, input);
	
	expect(extracted.$1).toBe('12');
	expect(extracted.$2).toBe('six');
	
});

test("Test extract - no match", () => {
	
	const input = "The RED fox is 12 years old, and has six children";
	
	expect(extractFromString(FoxRegex, input)).toBeNull();
	
});

const tryGetFoxAge = input => extractFromString(FoxRegex, input);

test("Test extract.on fluent API", () => {
	
	const toBeCalled = jest.fn().mockImplementation( matches => {expect(matches.$1).toBe('12')} );
	extract.on("The brown fox is 12 years old, and has six children", tryGetFoxAge).do( toBeCalled );
	expect(toBeCalled).toHaveBeenCalled();
	
	const notToBeCalled = jest.fn();
	extract.on("Some non matching text - that does not call the 'do'-function", tryGetFoxAge).do( notToBeCalled )
	expect(notToBeCalled).not.toHaveBeenCalled();
	
});
