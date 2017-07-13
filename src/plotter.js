const {spawn} = require('child_process');
const path = require('path');
const co = require('co');
const throttle = require('lodash.throttle');
const debounce = require('lodash.debounce');
const {log,error} = require('./outputRenderer');
const chalk = require('chalk');

const xplotter = path.resolve(process.env.XPLOTTER_EXE);

const context = {
	totalNonces : 0,
	totalRemainingNonces : 0
};

const execPlot = function *(args) {
	
	const {accountId, startNonce, nonces, threads, path, memory} = args;
	
	// Xplotter.exe -id <ID> -sn <start_nonce> [-n <nonces>] -t <threads> [-path <d:/plots>] [-mem <8G>]
	const plotterArgs = [
		'-id', accountId,
		'-sn', startNonce,
		'-n', nonces,
		'-t', threads,
		'-path', path.endsWith('/') ? path : path + '/',
		'-mem', `${memory}M`
	];
	
	yield new Promise(function (resolve) {
		
		const dir = spawn(xplotter, plotterArgs);
		dir.stdout.on('data', log.bind(null, context));
		
		dir.stderr.on('data', err => {
			error(err);
			reject(err);
		});
		
		dir.on('close', code => {
			if(code !== 0){
				console.log(chalk`🖕 {redBright Fuck!} - Something went wrong (code ${code})`);
			}
			else{
				console.log(chalk`🍻 {greenBright Yay!} - Plot created successfully`);
			}
			resolve()
		});
		
	});
	
};


function _start(args) {
	
	const {totalNonces, plots, accountId, path, threads, memory} = args;
	
	context.totalNonces =
	context.totalRemainingNonces = totalNonces;
	
	return co(function *() {
		for (let i = 0; i < plots.length; ++i) {

			const plot = plots[i];
			
			console.log(chalk`{green ------------------------------------------}`);
			console.log(chalk`{whiteBright Starting plot ${i+1}/${plots.length}} - Nonces {whiteBright ${plot.startNonce}} to {whiteBright ${plot.startNonce + plot.nonces}}`);
			console.log(chalk`{green ------------------------------------------}`);
			
			context.currentPlotNonces=plot.nonces;
			
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
		
		console.log(chalk`{greenBright 🎉 Tadaa 🍾} {whiteBright Finished Plotting. Awesome...} {magentaBright 💲Happy Mining!💰}`)
	
	});
	
}


module.exports = {
	start: _start
};