const loggly = require("node-loggly-bulk");
const {format} = require("date-fns");
const {version} = require("../package");
const {LOGGLY_TOKEN, LOGGLY_SUBDOMAIN} = require('./config');
const {isDevelopmentMode} = require("./utils");
const $ = require("./selectors");

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

	if(!$.selectIsLogEnabled()) return;

	client = client || loggly.createClient({
		token: LOGGLY_TOKEN,
		subdomain: LOGGLY_SUBDOMAIN,
		tags: isDevelopmentMode() ? ["autoplotter-dev"] : ["autoplotter"],
		json: true
	});
	
	client.log(createLogMessage(type, message, obj));
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
	return new Promise(resolve => {
		if (!this.flushing) {
			this.flushing = setTimeout(resolve, 3000);
		}
	})
}

module.exports = {
	log,
	error,
	info,
	debug,
	flush
};
