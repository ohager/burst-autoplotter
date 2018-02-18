const {spawn} = require('child_process');
const path = require("path");
const cache = require('../cache');
const co = require('co');
const {XPLOTTER_SSE_EXE, XPLOTTER_AVX_EXE, XPLOTTER_AVX2_EXE} = require('../config');
const validator = require("../validator/validator");

const store = require("../store");
const $ = require("../selectors");
const view = require("../views/index");

const handleStdoutData = require("./stdoutHandler");
const handleClose = require("./closeHandler");

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
		
		process.stdout.on('data', handleStdoutData);
		
		process.stderr.on('data', err => {
			reject(err.toString());
		});
		
		process.on('close', code => {
			handleClose(code);
			resolve();
		});
		
	});
	
};

function start({totalNonces, plots, accountId, path, threads, memory, instSet}) {
	
	return co(function* () {
		
		view.start();
		
		const interval = setInterval(() => {
			store.update(()=>({
				elapsedTime :  Date.now()
			}))
		}, 1000);
		
		try {
			for (let i = 0; i < plots.length; ++i) {
				
				const plot = plots[i];
				
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
				
				// may reject
				yield plotter.call(this,
					{
						accountId,
						path,
						startNonce: plot.startNonce,
						nonces: plot.nonces,
						threads,
						memory
					});
				
				// once successful update the cache!
				cache.update({lastNonce: plot.startNonce + plot.nonces}, $.selectCacheFile());
			}
			
			yield validator.call(this, path);
			
		} catch (e) {
			store.update(() => ({
					error: e
				})
			);
		}
		
		clearInterval(interval);
		view.stop();
	});
}

module.exports = {
	start
};