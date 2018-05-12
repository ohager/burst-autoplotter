const fs = require("fs");

const NoOp = () => {};

function move(sourceFile, destFile, onProgress = NoOp, onEnd = NoOp) {
	
	const stat = fs.statSync(sourceFile);
	
	const totalSizeBytes = stat.size;
	let copiedBytes = 0;
	
	const readStream = fs.createReadStream(sourceFile);
	
	readStream.on('data', function (buffer) {
		
		copiedBytes += buffer.length;
		
		onProgress({
			isMoving: true,
			totalSizeBytes,
			copiedBytes
		})
		
	});
	
	readStream.on('error', function (err) {
		
		onEnd({
			error: err,
			isMoving: false,
			totalSizeBytes: 0,
			copiedBytes: 0
		});
		readStream.close();
		
	});
	
	readStream.on('end', function () {
		
		onEnd({
			isMoving: false,
			totalSizeBytes,
			copiedBytes
		});
		readStream.close();
		
	});
	readStream.pipe(fs.createWriteStream(destFile));
}

module.exports = move;
