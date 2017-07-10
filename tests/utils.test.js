const {gib2b, b2gib, b2mib} = require('../src/utils');

const ONEGIB = 1073741824;
const ONEMIB = 1048576;

test("GigaBytes to Bytes", () => {
	
	expect(gib2b(0)).toBe(0);
	expect(gib2b(1)).toBe(ONEGIB);
	expect(gib2b(2)).toBe(ONEGIB*2);
	
});

test("Bytes to GigaBytes", () => {
	
	expect(b2gib(0)).toBe(0);
	expect(b2gib(ONEGIB/2)).toBe(0.5);
	expect(b2gib(ONEGIB)).toBe(1);
	expect(b2gib(ONEGIB*2)).toBe(2);
	
});

test("Bytes to MegaBytes", () => {
	
	expect(b2mib(0)).toBe(0);
	expect(b2mib(ONEMIB/2)).toBe(0.5);
	expect(b2mib(ONEMIB)).toBe(1);
	expect(b2mib(ONEMIB*2)).toBe(2);
	
});