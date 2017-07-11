const {spawn} = require('child_process');
const co = require('co');
const throttle = require('lodash.throttle');
const prettify = require('./prettifyOutput');
const chalk = require('chalk');

const execPlot = function *(args) {
	
	const {exe, accountId, startNonce, nonces, threads, path, memory} = args;

	
	// Xplotter.exe -id <ID> -sn <start_nonce> [-n <nonces>] -t <threads> [-path <d:/plots>] [-mem <8G>]
	const plotterArgs = [
		'-id', accountId,
		'-sn', startNonce,
		'-n', nonces,
		'-t', threads,
		'-path', path.endsWith('/') ? path : path + '/',
		'-mem', `${memory}M`
	];
	
	console.log("Used Plotter:", exe);
	console.log("Start plotting:", plotterArgs.join(' '));
	
	yield new Promise(function (resolve) {
		
		const dir = spawn(exe, plotterArgs);
		
		dir.stdout.on('data', throttle(prettify,1000));
		
		dir.on('close', code => {
			if(code !== 0){
				console.log(chalk`🖕 {red Fuck!} - Something went wrong (code ${code})`);
			}
			else{
				console.log(chalk`🍻 {green Yay!} - Plot created successfully`);
			}
			resolve()
		});
		
	});
	
};


function _start(args) {
	
	const {exe, plots, accountId, path, threads, memory} = args;
	
	return co(function *() {
		for (let i = 0; i < plots.length; ++i) {
			const plot = plots[i];
			yield execPlot.call(this,
				{
					exe,
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