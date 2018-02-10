const {gib2b, b2gib, b2mib, formatTimeString} = require('../src/utils');

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

test("Seconds to timestring", () => {
	
	expect(formatTimeString("bla")).toBe('??:??:??');
	expect(formatTimeString(null)).toBe('??:??:??');
	expect(formatTimeString(undefined)).toBe('??:??:??');
	expect(formatTimeString(0)).toBe('00:00:00');
	expect(formatTimeString(15)).toBe('00:00:15');
	expect(formatTimeString(60)).toBe('00:01:00');
	expect(formatTimeString(152)).toBe('00:02:32');
	expect(formatTimeString(3752)).toBe('01:02:32');
	
});

