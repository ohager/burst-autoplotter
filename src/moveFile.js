const fs = require("fs");

const NoOp = () => {
};

function move(sourceFile, destFile, onProgress = NoOp, onEnd = NoOp) {
	return new Promise((resolve, reject) => {
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
			reject(err);
		});
		
		readStream.on('end', function () {
			
			const result = {
				error: null,
				isMoving: false,
				totalSizeBytes,
				copiedBytes
			};
			
			readStream.close();
			fs.unlinkSync(sourceFile);
			onEnd(result);
			resolve(result);
			
		});
		readStream.pipe(fs.createWriteStream(destFile));
	});
}

module.exports = move;
