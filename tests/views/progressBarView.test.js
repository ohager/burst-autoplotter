const progressBar = require("../../src/views/progressBarView");

it("Test progressBar View", () => {
	
	expect(progressBar(0,10,0,10)).toBe("[          ]");
	expect(progressBar(0,10,10,10)).toBe("[##########]");
	expect(progressBar(0,10,5,10)).toBe("[#####     ]");
	expect(progressBar(0,10,5,10,'=')).toBe("[=====     ]");
	
});