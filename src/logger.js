//const loggly = require("node-loggly-bulk");
const fs = require("fs-extra");
const {format} = require("date-fns");
const winston = require("winston");
const path = require("path");
const {version} = require("../package");
//const {LOGGLY_TOKEN, LOGGLY_SUBDOMAIN} = require('./config');

const {isDevelopmentMode} = require("./utils");

let enabled = false;
let logFile = null;
let client = null;

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
	if(!logFile) throw new Error("Logger not initialized");
	
	try {
		const msg = createLogMessage(type, message, obj);
		winston.log(type, msg);
	} catch (e) {
		// omit exception silently,...don't bother plotter
	}
	
	/*
	client = client || loggly.createClient({
		token: LOGGLY_TOKEN,
		subdomain: LOGGLY_SUBDOMAIN,
		tags: isDevelopmentMode() ? ["autoplotter-dev"] : ["autoplotter"],
		json: true
	});

	try {
		client.log(createLogMessage(type, message, obj));
	}
	catch(e){
		console.log("LOGGING ERROR:", e);
		console.log("If it persists you should disable logging (using -e option on setup)");
		// ignore silently...just not to bother the plotting...
	}
	*/
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
	
	if(!enabled) return Promise.resolve();
	
	console.log("Log written to: ", logFile);
	
	// TODO: send to loggly then
	return new Promise(resolve => {
		if (!this.flushing) {
			this.flushing = setTimeout(resolve, 3000);
		}
	})
}

function init(opts){
	
	enabled = opts.logEnabled;
	
	if(!enabled) return;
	
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
