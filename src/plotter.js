const spawn = require('child_process').spawn;
const co = require('co');

const execPlot = function *(args) {
	
	const {accountId, startNonce, nonces, threads, path, memory} = args;
	// Xplotter.exe -id <ID> -sn <start_nonce> [-n <nonces>] -t <threads> [-path <d:\plots>] [-mem <8G>]
	const plotterArgs = `-id ${accountId} -sn ${startNonce} -n ${nonces} -t ${threads} -path ${path}`
	
	console.log("Start plotting:", plotterArgs);
	
	yield new Promise(function (resolve) {
		setTimeout(() => {
			console.log("Plotting ok");
			resolve();
		}, 3000)
	});
	
};


function _start(args) {
	
	const {plots, accountId, path, threads, memory} = args;
	
	return co(function *() {
		for (let i = 0; i < plots.length; ++i) {
			const plot = plots[i];
			yield execPlot.call(this,
				{
					accountId,
					path,
					startNonce: plot.startNonce,
					nonces: plot.nonces,
					threads,
					memory
				})
		}
	});
}


module.exports = {
	start: _start
};