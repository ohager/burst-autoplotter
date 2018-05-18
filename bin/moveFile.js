const fs = require("fs");
const throttle = require("lodash.throttle");

const NoOp = () => {};

function move(sourceFile, destFile, onProgress = NoOp, onEnd = NoOp) {

	const throttledOnProgress = throttle(onProgress, 500);

	return new Promise((resolve, reject) => {
		const stat = fs.statSync(sourceFile);
		const totalSizeBytes = stat.size;
		let copiedBytes = 0;

		const readStream = fs.createReadStream(sourceFile);

		readStream.on('data', function (buffer) {

			copiedBytes += buffer.length;

			throttledOnProgress({
				isMoving: true,
				totalSizeBytes,
				copiedBytes
			});
		});

		readStream.on('error', function (err) {

			throttledOnProgress.cancel();

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

			throttledOnProgress.cancel();

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