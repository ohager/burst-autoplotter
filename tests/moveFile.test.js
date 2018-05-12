const fs=require("fs");
const path = require("path");
const moveFile= require("../src/moveFile");
const store = require("../src/store");

const SourceFile = path.join(__dirname, "testfile.dat");
const TargetFile = path.join(__dirname, "testfile.moved.dat");

beforeAll(() => {
	// create File
	const data = new Array(10 * 1024 * 1024); // 10 MiB
	fs.writeFileSync(SourceFile, Buffer.from(data));
});

afterAll(() => {
	fs.unlinkSync(SourceFile);
});

afterEach( () => {
	fs.unlinkSync(TargetFile);
});

test("moveFile", (done) => {
	
	moveFile(SourceFile, TargetFile, (stat) => {
		expect(stat.isMoving).toBeTruthy();
		expect(stat.copiedBytes).toBeLessThanOrEqual(stat.totalSizeBytes);
	}, (stat) => {
		
		expect(stat.copiedBytes).toBe(stat.totalSizeBytes);
		expect(stat.isMoving).toBeFalsy();
		expect(fs.existsSync(TargetFile)).toBeTruthy();
		expect(fs.statSync(TargetFile).size).toBe(stat.totalSizeBytes);
		
		done();
	})

});
