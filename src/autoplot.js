const fs = require('fs-extra');
const chalk = require('chalk');
const commandLineArgs = require('command-line-args');

const store = require('./store');
const {PLOTS_DIR} = require('./config');
const {version, author} = require('../package.json');

const plotter = require('./plotter');
const createPlotPartition = require('./plotPartition');
const {hasAdminPrivileges} = require('./privilege');
const {checkInstructionSet} = require('./isc');
const ui = require('./ui');
const cache = require('./cache');

const isDevMode = process.env.NODE_ENV === 'development';

const options = commandLineArgs([
	{name: 'cache', alias: 'c', type: String},
	{name: 'extended', alias: 'e', type: Boolean},
]);

const getInstructionSetInformation = () => {
	
	const instSet = checkInstructionSet();
	let recommended = 'SSE';
	if (instSet.avx) recommended = 'AVX';
	if (instSet.avx2) recommended = 'AVX2';
	
	return {
		raw: instSet,
		supported: Object.keys(instSet).map(k => instSet[k] ? k.toUpperCase() : ''),
		recommended: recommended
	}
};

(function run() {
	
	console.log('\n');
	console.log(chalk`{whiteBright --------------------------------------------------}`);
	console.log(chalk`{blueBright.bold BURST Auto Plotter} based on XPlotter`);
	console.log(chalk`Version {whiteBright ${version}}`);
	console.log(`by ${author.name}`);
	if (options.extended) {
		console.log('\n');
		console.log(chalk`{whiteBright Extended Mode Activated}`);
		console.log('\n');
	}
	console.log(chalk`{whiteBright --------------------------------------------------}`);
	console.log('\n');
	
	if (!isDevMode && !hasAdminPrivileges()) {
		console.log(chalk`🚸 {redBright No Admin rights!}`);
		console.log('For significantly faster writes you should run autoplotter as administrator');
		process.exit(666);
		return;
	}
	
	const instructionSetInfo = getInstructionSetInformation();
	console.log(chalk`Supported Instruction Sets: {whiteBright ${instructionSetInfo.supported}}`);
	console.log(chalk`Selected Instruction Set: {yellowBright ${instructionSetInfo.recommended}}`);
	console.log('\n');
	
	ui.run(cache.load(options.cache), {extended: options.extended})
		.then(answers => {
			cache.update(answers, options.cache);
			return answers;
		}).then(answers => {
		
		let path = '';
		try {
			const {accountId, hardDisk, startNonce, totalPlotSize, chunks, threads, memory} = answers;
			path = `${hardDisk}:/${PLOTS_DIR}`;
			
			fs.ensureDirSync(path);
			
			const {totalNonces, plots} = createPlotPartition(totalPlotSize, startNonce, chunks);
			
			const lastPlot = plots[plots.length - 1];
			
			store.update(() => ({cacheFile: options.cache}));
			
			console.log(chalk`Created partition for {whiteBright ${totalPlotSize} GiB} in {whiteBright ${chunks} chunk(s)}`);
			console.log(chalk`Overall nonces to be written: {whiteBright ${totalNonces}}`);
			console.log(chalk`Threads used: {whiteBright ${threads}}`);
			console.log(chalk`Memory used: {whiteBright ${memory}MiB}`);
			
			// TODO: pass arguments to store -> centralize things!
			plotter.start({
				totalNonces,
				plots,
				accountId,
				path,
				threads,
				memory,
				instSet: instructionSetInfo.recommended,
			});
			
		} catch (e) {
			//TODO review this exception here!
			console.error(`Couldn't create directory ${path} - reason: ${e}`);
			process.exit(666);
		}
	});
	
})();