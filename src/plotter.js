const {spawn, spawnSync} = require('child_process');
const cache = require('./cache');
const path = require('path');
const co = require('co');
const chalk = require('chalk');
const {format} = require('date-fns');
const {formatTimeString} = require('./utils');
const {XPLOTTER_SSE_EXE, XPLOTTER_AVX_EXE, XPLOTTER_AVX2_EXE, PLOT_VALIDATOR} = require('./config');
const {logPlotter, logPlotterEnd, logValidator, error} = require('./outputRenderer');

const extractor = require('./extractor');
const store = require("./store");
const $ = require("./selectors");
const view = require("./views");

const getPlotterPath = () => {
	
	const instSet = $.selectInstructionSet();
	
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

//TODO move to validator
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

// todo: see how to structure better, make it testable
const onStdoutData = (output) => {
	const text = output.toString();
	
	if ($.selectIsAVX()) {
		
		const currentNonceChunk = extractor.avx.tryGetNoncesChunkedRange(text);
		if (currentNonceChunk) {
			store.update(state => (
				// state is immutable - need to create copies
				{
					currentPlot: {
						...state.currentPlot,
						avx: {
							...state.currentPlot.avx,
							chunkStart: +currentNonceChunk.$1,
							chunkEnd: +currentNonceChunk.$2
						}
					},
				}
			));
		}
		
		const currentChunkPercentage = extractor.avx.tryGetCurrentChunkPercentage(text);
		if (currentChunkPercentage) {
			
			store.update(state => {
					const percentage = +currentChunkPercentage.$1;
					const chunkSize = state.currentPlot.avx.chunkEnd - state.currentPlot.avx.chunkStart;
					const chunkWrittenNonces = Math.floor(chunkSize * (percentage / 100));
					const writtenNoncesDelta = chunkWrittenNonces > state.currentPlot.avx.chunkWrittenNonces ?
						chunkWrittenNonces - state.currentPlot.avx.chunkWrittenNonces : chunkWrittenNonces;
					
					// state is immutable - need to create copies
					return {
						totalWrittenNonces: state.totalWrittenNonces + writtenNoncesDelta,
						currentPlot: {
							...state.currentPlot,
							writtenNonces: state.currentPlot.writtenNonces + writtenNoncesDelta,
							avx: {
								...state.currentPlot.avx,
								chunkWrittenNonces: chunkWrittenNonces,
								chunkPercentage: percentage,
							}
						},
					}
				}
			);
		}
	}
	else {
		const currentNonces = extractor.sse.tryGetNoncesPerMin(text);
		if (currentNonces) {
			const plotWrittenNonces = +currentNonces.$1;
			
			store.update(state => (
				{
					totalWrittenNonces: state.totalWrittenNonces + plotWrittenNonces,
					currentPlot: {
						...state.currentPlot,
						writtenNonces: plotWrittenNonces,
					}
				}))
		}
	}
	
};

const execPlot = function* (args) {
	
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
		
		process.stdout.on('data', onStdoutData);
		
		process.stderr.on('data', err => {
			error(err);
			reject(err);
		});
		
		process.on('close', code => {
			
			//logPlotterEnd(context);
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
			
			// TODO: set all progress to completed (totalnonces, 100%, etc.)
			
			if (code !== 0) {
				console.log(chalk`{redBright 🖕Bah!} - Plotting failed.`);
			}
			else {
				console.log(chalk`{yellowBright 🍻}{greenBright Yay!} - Plot created successfully`);
			}
			resolve()
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
				yield execPlot.call(this,
					{
						accountId,
						path,
						startNonce: plot.startNonce,
						nonces: plot.nonces,
						threads,
						memory
					});
			}
			
			// TODO: move to views
			console.log(chalk`{green ------------------------------------------}`);
			console.log(chalk`{whiteBright Validating plot(s) in ${path}}`);
			console.log(chalk`{green ------------------------------------------}`);
			
			//yield execValidator.call(this, path);
			
			cache.update({lastNonce: plot.startNonce + plot.nonces}, $.selectCacheFile());
			
			// TODO: move to views
			//_writeFinalStats();
			
			console.log(chalk`{greenBright 🎉 Tadaa 🍾} {whiteBright Finished Plotting. Awesome...} {magentaBright 💲Happy Mining!💰}`)
		} catch (e) {
			// noop, already handled
		}
		
		view.stop();
	});
	
}

module.exports = {
	start
};