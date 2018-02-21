const progressBar = require("../../../src/views/console/progressBarView");

it("Test progressBar View", () => {
	
	expect(progressBar(0,10,0,10)).toBe("[          ]");
	expect(progressBar(0,10,10,10)).toBe("[##########]");
	expect(progressBar(0,10,5,10)).toBe("[#####     ]");
	expect(progressBar(0,10,5,10,'=')).toBe("[=====     ]");
	
});

it("Test progressBar View - Invalid values", () => {
	
	expect(progressBar(10,10,5,10,'=')).toBe("[          ]");
	expect(progressBar(0,0,5,10,'=')).toBe("[          ]");
	expect(progressBar(0,10,15,10,'=')).toBe("[==========]");
	expect(progressBar(0,10,5,0,'=')).toBe("[#INV:(0,10,5,0)]");
	expect(progressBar('s',10,5,10,'=')).toBe("[#INV:(s,10,5,10)]");
	expect(progressBar(0,'s',5,10,'=')).toBe("[#INV:(0,s,5,10)]");
	expect(progressBar(0,10,'s',10,'=')).toBe("[#INV:(0,10,s,10)]");
	expect(progressBar(0,10,5,'s','=')).toBe("[#INV:(0,10,5,s)]");
	
});