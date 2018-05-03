var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

let flush = (() => {
	var _ref = _asyncToGenerator(function* () {
		var _this = this;

		return new Promise(function (resolve) {
			if (!_this.flushing) {
				_this.flushing = setTimeout(resolve, 3000);
			}
		});
	});

	return function flush() {
		return _ref.apply(this, arguments);
	};
})();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const loggly = require("node-loggly-bulk");
const { format } = require("date-fns");
const { version } = require("../package");
const { LOGGLY_TOKEN, LOGGLY_SUBDOMAIN } = require('./config');
const { isDevelopmentMode } = require("./utils");
const $ = require("./selectors");

let client = null;

function createLogMessage(type, message, payload) {
	return _extends({
		created: format(new Date()),
		type,
		version,
		message
	}, payload);
}

function log(type, message, obj = {}) {

	if (!$.selectIsLogEnabled()) return;

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

module.exports = {
	log,
	error,
	info,
	debug,
	flush
};