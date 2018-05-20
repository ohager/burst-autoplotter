const fs = require("fs-extra");
const readline = require("readline");
const winston = require("winston");
const path = require("path");
const {format} = require("date-fns");
const loggly = require("node-loggly-bulk");
const {version} = require("../package");
const {LOGGLY_TOKEN, LOGGLY_SUBDOMAIN} = require('./config');

const {isDevelopmentMode} = require("./utils");
let enabled = false;
let logFile = null;


function submitToLoggly() {
	
	return new Promise((resolve, reject) => {
		
		const client = loggly.createClient({
			token: LOGGLY_TOKEN,
			subdomain: LOGGLY_SUBDOMAIN,
			tags: isDevelopmentMode() ? ["autoplotter-dev"] : ["autoplotter"],
			json: true,
		});
		
		const lineReader = readline.createInterface({
			input: fs.createReadStream(logFile)
		});

		let lineCount=0;
		lineReader.on('line', (line) => {
			++lineCount;
			client.log(line);
		});
		
		lineReader.on('error', (error) => {
			reject(error);
		});
		
		lineReader.on('close', () => {
			let remainingSecs = 5;
			const interval = setInterval(() => {
				if(remainingSecs === 0){
					clearInterval(interval);
					resolve();
					return;
				}
				const cli = process.stdout;
				cli.cursorTo(0);
				cli.clearLine();
				cli.write(`Submitting ${lineCount} log entries...closing in ${remainingSecs--} second(s)`)
			}, 1000)
		});
		
	})
}

function createLogMessage(type, message, payload) {
	return {
		created: format(new Date()),
		type,
		version,
		message,
		...payload
	}
}

function log(type, message, obj = {}) {
	
	if (!enabled) return;
	if (!logFile) throw new Error("Logger not initialized");
	
	try {
		const msg = createLogMessage(type, message, obj);
		winston.log(type, msg);
	} catch (e) {
		// omit exception silently,...don't bother plotter
	}
}

function error(message, obj) {
	log("error", message, obj);
}

function info(message, obj) {
	log("info", message, obj);
}

function debug(message, obj) {
	log("debug", message, obj);
}


async function flush() {
	
	if (!enabled) return Promise.resolve();
	
	console.log("Log written to: ", logFile);
	
	return await submitToLoggly();
}

function init(opts) {
	
	enabled = opts.logEnabled;
	
	if (!enabled) return;
	
	const logDir = path.join(__dirname, "../logs");
	fs.ensureDirSync(logDir);
	logFile = path.join(logDir, `${format(Date.now(), "YYYYMMDD_hhmmss")}.log`);
	winston.configure({
		handleExceptions: true,
		humanReadableUnhandledException: true,
		transports: [
			new (winston.transports.File)({filename: logFile})
		]
	});
	
}

module.exports = {
	init,
	log,
	error,
	info,
	debug,
	flush
};
