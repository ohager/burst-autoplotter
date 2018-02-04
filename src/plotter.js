const {XPLOTTER_SSE_EXE, XPLOTTER_AVX_EXE, XPLOTTER_AVX2_EXE, PLOT_VALIDATOR} = require('./config');
const {spawn, spawnSync} = require('child_process');
const path = require('path');
const co = require('co');
const {logPlotter, logPlotterEnd, logValidator, error} = require('./outputRenderer');
const chalk = require('chalk');

const context = {
	totalNonces: 0,
	totalRemainingNonces: 0,
	outputPath: ""
};

const getPlotterPath = (instSet) => {
	
	const exeDir = "../exe";
	switch (instSet) {
		case 'SSE':
			return path.join(__dirname, exeDir, XPLOTTER_SSE_EXE);
		case 'AVX':
			return path.join(__dirname, exeDir, XPLOTTER_AVX_EXE);
		case 'AVX2':
			return path.join(__dirname, exeDir, XPLOTTER_AVX2_EXE);
		default:
			throw "Unknown Instruction Set " + instSet;
	}
};

const validator = path.join(__dirname, "../exe", PLOT_VALIDATOR);

const execValidator = function* (plot) {
	
	// PlotsChecker.exe c:\burst\plot
	const validatorArgs = [plot];
	
	yield new Promise(function (resolve, reject) {
		
		const validatorResult = spawnSync(validator, validatorArgs);
		
		logValidator(validatorResult.stdout);
		
		if (validatorResult.status !== 0) {
			if (validatorResult.stderr) {
				error(validatorResult.stderr);
			}
			
			console.log(chalk`{redBright 😞 Doh!} - There is a problem with one or more plots.`);
			reject();
			return;
		}
		
		console.log(chalk`{greenBright 😊 Fine!} - Plot(s) seem(s) to be ok`);
		resolve();
	});
	
};

const execPlot = function* (args) {
	
	const {accountId, startNonce, nonces, threads, path, memory, instSet} = args;
	
	// Xplotter.exe -id <ID> -sn <start_nonce> [-n <nonces>] -t <threads> [-path <d:/plots>] [-mem <8G>]
	let plotterArgs = [
		'-id', accountId,
		'-sn', startNonce,
		'-n', nonces,
		'-path', path.endsWith('/') ? path : path + '/',
		'-t', threads,
	];
	
	// optional args
	if (memory) {
		plotterArgs.push('-mem', `${memory}M`)
	}
	
	const xplotter = getPlotterPath(instSet);
	
	yield new Promise(function (resolve, reject) {
		
		const process = spawn(xplotter, plotterArgs);
		process.stdout.on('data', logPlotter.bind(null, context));
		
		process.stderr.on('data', err => {
			error(err);
			reject(err);
		});
		
		process.on('close', code => {
			
			logPlotterEnd(context);
			
			if (code !== 0) {
				console.log(chalk`\n{redBright 🖕Bah!} - Plotting failed.`);
			}
			else {
				console.log(chalk`\n{yellowBright 🍻}{greenBright Yay!} - Plot ${context.currentPlotIndex} created successfully`);
			}
			resolve()
		});
		
	});
	
};

function _writeFinalStats() {
	
	const p = v => v < 10 ? '0' + v : v;
	
	const elapsedTimeSecs = (context.endTime - context.startTime) / 1000;
	const hours = Math.floor(elapsedTimeSecs / 3600);
	const mins = Math.floor((elapsedTimeSecs % 3600) / 60);
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
	
	const {totalNonces, plots, accountId, path, threads, memory, instSet} = args;
	
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
				
				yield execPlot.call(this,
					{
						accountId,
						path,
						startNonce: plot.startNonce,
						nonces: plot.nonces,
						threads,
						memory,
						instSet
					});
			}
			
			yield execValidator.call(this, path);
			
			context.endTime = Date.now();
			
			console.log(chalk`{green ------------------------------------------}`);
			console.log(chalk`{whiteBright Validating plot(s) in ${path}}`);
			console.log(chalk`{green ------------------------------------------}`);
			
			_writeFinalStats();
			
			console.log(chalk`{greenBright 🎉 Tadaa 🍾} {whiteBright Finished Plotting. Awesome...} {magentaBright 💲Happy Mining!💰}`)
		} catch (e) {
			// noop, already handled
		}
		
	});
	
}


module.exports = {
	start: _start
};