const handleStdout = require("../../src/validator/stdoutHandler");
const store = require("../../src/store");

test("Test validator.handleStdout", () => {
	
	const text = "file: 12345678901234567890_0_4096_4096    checked - OK\r\n" +
	"file: 12345678901234567890_4096_4096_4096    checked - OK\r\n";
	handleStdout(text);
	
	const {validatedPlots} = store.get();
	
	expect(validatedPlots.length).toBe(2);
	expect(validatedPlots[0].isValid).toBeTruthy();
	expect(validatedPlots[0].plot).toBe("12345678901234567890_0_4096_4096");
	expect(validatedPlots[1].isValid).toBeTruthy();
	expect(validatedPlots[1].plot).toBe("12345678901234567890_4096_4096_4096");
	
});


test("Test validator.handleStdout", () => {
	
	const text = "file: 12345678901234567890_0_4096_4096    checked - OK\r\n" +
	"file: 12345678901234567890_4096_4096_4096    ERROR some text\r\n";
	handleStdout(text);
	
	const {validatedPlots} = store.get();
	
	expect(validatedPlots.length).toBe(2);
	expect(validatedPlots[0].isValid).toBeTruthy();
	expect(validatedPlots[0].plot).toBe("12345678901234567890_0_4096_4096");
	expect(validatedPlots[1].isValid).toBeFalsy();
	expect(validatedPlots[1].plot).toBe("12345678901234567890_4096_4096_4096");
	
});