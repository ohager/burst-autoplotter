const fs = require('fs-extra');
const chalk = require('chalk');
const {version, author} = require('../package.json');
const {hasAdminPrivileges} = require('./privilege');

const store = require('./store');
const {PLOTS_DIR} = require('./config');

const plotter = require('./plotter');
const createPlotPartition = require('./plotPartition');
const command = require('./command/command');
const cache = require('./cache');

const isDevMode = () => process.env.NODE_ENV === 'development';

function startPlotter(answers) {
	let path = '';
	try {
		const {accountId, hardDisk, startNonce, totalPlotSize, chunks, threads, memory, instructionSet} = answers;
		
		path = `${hardDisk}:/${PLOTS_DIR}`;
		
		fs.ensureDirSync(path);
		
		const {totalNonces, plots} = createPlotPartition(totalPlotSize, startNonce, chunks);
		
		store.update(() => ({
			totalPlotSize,
			account: accountId,
			cacheFile: options.cache,
			usedThreads: threads,
			usedMemory: memory,
			startTime: Date.now(),
			totalNonces,
			totalWrittenNonces: 0,
			totalStartNonce: +startNonce,
			instructionSet,
			outputPath: path,
			plotCount: plots.length,
			done: false,
		}));
		
		plotter.start({
			totalNonces,
			plots,
			accountId,
			path,
			threads,
			memory,
			instSet: instructionSet,
		});
		
	} catch (e) {
		console.error(`Woop: Something failed - reason: ${e}`);
		process.exit(666);
	}
}

command.start();

/*
function deprecated() {
	
	if (isDevMode()) {
		const devAnswers = {
			accountId: '1234567890123456700',
			hardDisk: 'C',
			totalPlotSize: '3',
			chunks: '1',
			startNonce: '0',
			threads: 7,
			memory: '8192',
			instructionSet: 'AVX2'
		};
		fs.removeSync(`${devAnswers.hardDisk}:/${PLOTS_DIR}`);
		startPlotter(devAnswers);
		return;
	}
	
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
	
	if (!isDevMode() && !hasAdminPrivileges()) {
		console.log(chalk`🚸 {redBright No Admin rights!}`);
		console.log('You need to run autoplotter as administrator');
		process.exit(666);
		return;
	}
	
	const instructionSetInfo = {}; //getInstructionSetInformation();
	
	run
		.Run(cache.load(options.cache), {
			extended: options.extended,
			mail: options.mail,
			instructionSetInfo: instructionSetInfo
		})
		.then(answers => {
			console.log(answers);
			throw new Error("forced abort")
		})
		.then(answers => {
			cache.update(answers, options.cache);
			return answers;
		}).then(startPlotter);
	
}*/