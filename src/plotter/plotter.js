const {spawn} = require('child_process');
const path = require("path");
const cache = require('../cache');
const co = require('co');
const chalk = require('chalk');
const {format} = require('date-fns');
const {formatTimeString} = require('../utils');
const {XPLOTTER_SSE_EXE, XPLOTTER_AVX_EXE, XPLOTTER_AVX2_EXE} = require('../config');
const {logPlotter, logPlotterEnd, logValidator, error} = require('../outputRenderer');
const validator = require("../validator");

const store = require("../store");
const $ = require("../selectors");
const view = require("../views/index");

const {handleData} = require("./onDataHandler");

const getPlotterPath = () => {
	
	const instSet = $.selectInstructionSet();
	
	const exeDir = "../../exe";
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

const plotter = function* (args) {
	
	const {accountId, startNonce, nonces, threads, path, memory} = args;
	
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
	
	const xplotter = getPlotterPath();
	
	yield new Promise(function (resolve, reject) {
		
		const process = spawn(xplotter, plotterArgs);
		
		process.stdout.on('data', handleData);
		
		process.stderr.on('data', err => {
			error(err);
			reject(err);
		});
		
		
		// TODO: handler for close event
		process.on('close', code => {
			
			//logPlotterEnd(context);
		
			console.log("closes received");
			
			store.update(state => {
				const remainingNonces = state.currentPlot.nonces - state.currentPlot.writtenNonces;
				return {
					totalWrittenNonces: state.totalWrittenNonces + remainingNonces,
					currentPlot: {
						...state.currentPlot,
						writtenNonces: state.currentPlot.totalNonces,
					}
				}
			});
			
			if (code !== 0) {
				console.log(chalk`{redBright 🖕Bah!} - Plotting failed.`);
				//reject();// use reject or not?
			}
			else {
				console.log(chalk`{yellowBright 🍻}{greenBright Yay!} - Plot created successfully`);
			}
			
			resolve();
		});
		
	});
	
};

function _writeFinalStats() {
	
	const state = store.get(); // TODO: use selectors instead - decouple dependency
	const elapsedTimeSecs = $.selectElapsedTimeInSecs();
	const totalNoncesPerMin = $.selectTotalNoncesPerMin();
	
	console.log(chalk`{greenBright ===========================================}`);
	console.log(chalk`Written Nonces: {whiteBright ${state.totalNonces}}`);
	console.log(chalk`Created Plots: {whiteBright ${state.currentPlot.index}}`);
	console.log(chalk`Time: {whiteBright ${format(new Date(), 'DD-MM-YYYY hh:mm:ss')}}`);
	console.log(chalk`Overall duration: {whiteBright ${formatTimeString(elapsedTimeSecs)}}`);
	console.log(chalk`Effective Nonces/min: {whiteBright ${totalNoncesPerMin}}`);
	console.log(chalk`Plots written to: {whiteBright ${state.outputPath}}`);
	
	console.log("\n");
	console.log(chalk`{blueBright Credits to Blago, Cerr Janro, and DCCT for their amazing XPlotter}`);
	console.log("\n");
}

function start(args) {
	
	const {totalNonces, plots, accountId, path, threads, memory, instSet} = args;
	
	store.update(() => ({
		startTime: Date.now(),
		totalNonces: totalNonces,
		totalWrittenNonces: 0,
		instructionSet: instSet,
		outputPath: path,
	}));
	
	return co(function* () {
		
		view.start();
		
		try {
			for (let i = 0; i < plots.length; ++i) {
				
				const plot = plots[i];
				
				// TODO: output must be moved to ui!
				/*
				console.log(chalk`{green ------------------------------------------}`);
				console.log(chalk`{whiteBright Starting plot ${i + 1}/${plots.length}} - Nonces {whiteBright ${plot.startNonce}} to {whiteBright ${plot.startNonce + plot.nonces}}`);
				console.log(chalk`{green ------------------------------------------}`);
				console.log("");
				*/
				// reset current plot state
				store.update(() => ({
						currentPlot: {
							index: i + 1,
							nonces: plot.nonces,
							writtenNonces: 0,
							avx: {
								chunkPercentage: 0.0,
								chunkStart: 0,
								chunkEnd: 0
							}
						},
					}
				));
				
				// TODO use store instead of arguments
				yield plotter.call(this,
					{
						accountId,
						path,
						startNonce: plot.startNonce,
						nonces: plot.nonces,
						threads,
						memory
					});
			
				// once successful update the shit! :)
				cache.update({lastNonce: plot.startNonce + plot.nonces}, $.selectCacheFile());
			}
			
			// TODO: move to views
			//console.log(chalk`{green ------------------------------------------}`);
			//console.log(chalk`{whiteBright Validating plot(s) in ${path}}`);
			//console.log(chalk`{green ------------------------------------------}`);
			
			// TODO: activate here
			//yield validator.call(this, path);
			
			
			// TODO: move to views
			//_writeFinalStats();
			
			//console.log(chalk`{greenBright 🎉 Tadaa 🍾} {whiteBright Finished Plotting. Awesome...} {magentaBright 💲Happy Mining!💰}`)
		} catch (e) {
			// TODO handle error correctly
			console.error(e);
			// noop, already handled? really!!>@?!
		}
		
		view.stop();
	});
}

module.exports = {
	start
};