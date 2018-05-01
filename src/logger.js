const winston = require('winston');
const {LOGGLY_TOKEN, LOGGLY_SUBDOMAIN} = require('./config');
const $ = require("./selectors");

require('winston-loggly-bulk');

function createLogMessage(type, message, payload) {
	return {
		label: type,
		message,
		...payload
	}
}

class Logger {
	constructor() {
		//	winston.clear();
		winston.add(winston.transports.Loggly, {
			inputToken: LOGGLY_TOKEN,
			subdomain: LOGGLY_SUBDOMAIN,
			tags: ["autoplotter"],
			json: true
		});
	}
	
	log(type, message, obj) {
		winston.log(createLogMessage(type, message, obj))
	}
	
	error(message, obj) {
		this.log("error", message, objs);
	}
	
	info(message, obj) {
		this.log("info", message, obj);
	}
	
	debug(message, obj) {
		this.log("debug", message, obj);
	}
}


module.exports = new Logger();
