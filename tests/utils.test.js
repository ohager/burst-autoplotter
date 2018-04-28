const fs = require("fs-extra");
const path = require("path");

const {
	gib2b,
	b2gib,
	b2mib,
	formatTimeString,
	formatDateTime,
	normalizeProgress,
	asMultipleOf,
	getNewestFileInDirectory,
} = require('../src/utils');

const ONEGIB = 1073741824;
const ONEMIB = 1048576;

test("GigaBytes to Bytes", () => {
	
	expect(gib2b(0)).toBe(0);
	expect(gib2b(1)).toBe(ONEGIB);
	expect(gib2b(2)).toBe(ONEGIB * 2);
	
});

test("Bytes to GigaBytes", () => {
	
	expect(b2gib(0)).toBe(0);
	expect(b2gib(ONEGIB / 2)).toBe(0.5);
	expect(b2gib(ONEGIB)).toBe(1);
	expect(b2gib(ONEGIB * 2)).toBe(2);
	
});

test("Bytes to MegaBytes", () => {
	
	expect(b2mib(0)).toBe(0);
	expect(b2mib(ONEMIB / 2)).toBe(0.5);
	expect(b2mib(ONEMIB)).toBe(1);
	expect(b2mib(ONEMIB * 2)).toBe(2);
	
});

test("Seconds to timestring", () => {
	
	expect(formatTimeString("bla")).toBe('N/A');
	expect(formatTimeString(null)).toBe('N/A');
	expect(formatTimeString(undefined)).toBe('N/A');
	expect(formatTimeString(0)).toBe('00:00:00');
	expect(formatTimeString(15)).toBe('00:00:15');
	expect(formatTimeString(60)).toBe('00:01:00');
	expect(formatTimeString(152)).toBe('00:02:32');
	expect(formatTimeString(3752)).toBe('01:02:32');
	expect(formatTimeString(1003752)).toBe('278:49:12');
	
});

test("Format TimeDate", () => {
	expect(formatDateTime(new Date('1995-12-17T03:24:12'))).toBe("17/12/1995 03:24:12");
	expect(formatDateTime(new Date('1976-01-01T00:00:00'))).toBe("01/01/1976 00:00:00");
});

test("Calculate normalized progress", () => {
	
	expect(normalizeProgress(0, 0, 0, 100)).toBe(0);
	expect(normalizeProgress(0, 0, 100, 100)).toBe(0);
	expect(normalizeProgress(0, 100, 0, 100)).toBe(0);
	expect(normalizeProgress(100, 100, 0, 100)).toBe(0);
	expect(normalizeProgress(0, 100, 100, 100)).toBe(100);
	expect(normalizeProgress(100, 100, 100, 100)).toBe(0);
	expect(normalizeProgress(0, 100, -1, 100)).toBe(0);
	expect(normalizeProgress(0, 100, 120, 100)).toBe(100);
	expect(normalizeProgress(0, 100, 20, 100)).toBe(20);
	expect(normalizeProgress(0, 100, 20, 50)).toBe(10);
	expect(normalizeProgress(0, 100, 100, 50)).toBe(50);
	expect(normalizeProgress(10, 110, 20, 50)).toBe(15);
	
	expect(normalizeProgress(0, 100, 20, 200)).toBe(40);
	
});

test("asMultipleOf Test", () => {
	
	expect(asMultipleOf(0, 2)).toBe(0);
	expect(asMultipleOf(2, 2)).toBe(2);
	expect(asMultipleOf(3, 2)).toBe(2);
	expect(asMultipleOf(10, 2)).toBe(10);
	expect(asMultipleOf(15, 2)).toBe(14);
	expect(asMultipleOf(16, 2)).toBe(16);

	expect(asMultipleOf(0, 8)).toBe(0);
	expect(asMultipleOf(8, 8)).toBe(8);
	expect(asMultipleOf(10, 8)).toBe(8);
	expect(asMultipleOf(15, 8)).toBe(8);
	expect(asMultipleOf(16, 8)).toBe(16);
	expect(asMultipleOf(24, 8)).toBe(24);
	
});


test("getNewestFileInDirectory", (done) => {

	const TEST_DIR = path.join(__dirname, "/testfiles");
	
	new Promise( (resolve, reject) => {
		let i = 0;
		const interval = setInterval( () => {
			fs.ensureFileSync(path.join(TEST_DIR,`test_${++i}.txt`));
			if(i === 3) {
				clearInterval(interval);
				resolve();
			}
		}, 250);
	}).then( () =>{
		expect(getNewestFileInDirectory(TEST_DIR) ).toBe(path.join(TEST_DIR,`test_3.txt`));
		fs.remove(TEST_DIR).then(done);
	} );
	
});
