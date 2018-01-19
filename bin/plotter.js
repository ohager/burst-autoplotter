const { XPLOTTER_EXE } = require('./config');
const { spawn } = require('child_process');
const path = require('path');
const co = require('co');
const { log, error } = require('./outputRenderer');
const chalk = require('chalk');

const context = {
	totalNonces: 0,
	totalRemainingNonces: 0,
	outputPath: ""
};

const xplotter = path.join(__dirname, "../exe", XPLOTTER_EXE);

const execPlot = function* (args) {

	const { accountId, startNonce, nonces, threads, path, memory } = args;

	// Xplotter.exe -id <ID> -sn <start_nonce> [-n <nonces>] -t <threads> [-path <d:/plots>] [-mem <8G>]
	let plotterArgs = ['-id', accountId, '-sn', startNonce, '-n', nonces, '-path', path.endsWith('/') ? path : path + '/', '-t', threads];

	// optional args
	if (memory) {
		plotterArgs.push('-mem', `${memory}M`);
	}

	yield new Promise(function (resolve, reject) {

		const process = spawn(xplotter, plotterArgs);
		process.stdout.on('data', log.bind(null, context));

		process.stderr.on('data', err => {
			error(err);
			reject(err);
		});

		process.on('close', code => {
			console.log("\n");

			if (code !== 0) {
				console.log(chalk`{redBright 🖕Bah!} - Plotting failed.`);
			} else {
				console.log(chalk`{yellowBright 🍻}{greenBright Yay!} - Plot ${context.currentPlotIndex} created successfully`);
			}
			resolve();
		});
	});
};

function _writeFinalStats() {

	const p = v => v < 10 ? '0' + v : v;

	const elapsedTimeSecs = (context.endTime - context.startTime) / 1000;
	const hours = Math.floor(elapsedTimeSecs / 3600);
	const mins = Math.floor(elapsedTimeSecs % 3600 / 60);
	const secs = Math.floor(elapsedTimeSecs % 60);
	const totalNoncesPerMin = Math.floor(context.totalNonces / (elapsedTimeSecs / 60));

	console.log(chalk`{greenBright ===========================================}`);
	console.log(chalk`Written Nonces: {whiteBright ${context.totalNonces}}`);
	console.log(chalk`Created Plots: {whiteBright ${context.currentPlotIndex}}`);
	console.log(chalk`Overall time: {whiteBright ${hours}:${p(mins)}:${p(secs)}}`);
	console.log(chalk`Nonces/min: {whiteBright ${totalNoncesPerMin}}`);
	console.log(chalk`Plots written to: {whiteBright ${context.outputPath}}`);

	console.log("\n");
	console.log(chalk`{blueBright Credits to Blago, Cerr Janro, and DCCT for their amazing XPlotter}`);
	console.log("\n");
}

function _start(args) {

	const { totalNonces, plots, accountId, path, threads, memory } = args;

	context.totalNonces = context.totalRemainingNonces = totalNonces;
	context.startTime = Date.now();

	return co(function* () {
		try {
			for (let i = 0; i < plots.length; ++i) {

				const plot = plots[i];

				console.log(chalk`{green ------------------------------------------}`);
				console.log(chalk`{whiteBright Starting plot ${i + 1}/${plots.length}} - Nonces {whiteBright ${plot.startNonce}} to {whiteBright ${plot.startNonce + plot.nonces}}`);
				console.log(chalk`{green ------------------------------------------}`);

				context.currentPlotNonces = plot.nonces;
				context.currentPlotIndex = i + 1;
				context.outputPath = path;

				yield execPlot.call(this, {
					accountId,
					path,
					startNonce: plot.startNonce,
					nonces: plot.nonces,
					threads,
					memory
				});
			}

			context.endTime = Date.now();

			_writeFinalStats();

			console.log(chalk`{greenBright 🎉 Tadaa 🍾} {whiteBright Finished Plotting. Awesome...} {magentaBright 💲Happy Mining!💰}`);
		} catch (e) {
			// noop, already handled
		}
	});
}

module.exports = {
	start: _start
};