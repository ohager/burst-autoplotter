let sendMailSinglePlotCompleted = (() => {
	var _ref = _asyncToGenerator(function* (options, data) {

		const plotFinishedFile = path.join(__dirname, './html', 'singlePlotFinished.html');
		const message = template.render(plotFinishedFile, data);

		return sendMail(options, `🍻 Plot ${data.currentPlot}/${data.plotCount} finished`, message);
	});

	return function sendMailSinglePlotCompleted(_x, _x2) {
		return _ref.apply(this, arguments);
	};
})();

let sendMailAllPlotsCompleted = (() => {
	var _ref2 = _asyncToGenerator(function* (options, data) {

		const allPlotsFinishedFile = path.join(__dirname, './html', 'allPlotsFinished.html');
		const message = template.render(allPlotsFinishedFile, data);

		return sendMail(options, '🎉 Finally, plotting completed', message);
	});

	return function sendMailAllPlotsCompleted(_x3, _x4) {
		return _ref2.apply(this, arguments);
	};
})();

let sendMailFailure = (() => {
	var _ref3 = _asyncToGenerator(function* (options, data) {

		const failureFile = path.join(__dirname, './html', 'failure.html');
		const message = template.render(failureFile, data);

		return sendMail(options, '😭 Oh no. Something went wrong', message);
	});

	return function sendMailFailure(_x5, _x6) {
		return _ref3.apply(this, arguments);
	};
})();

let sendMailSetupSuccessMessage = (() => {
	var _ref4 = _asyncToGenerator(function* () {
		const options = cache.load($.selectCacheFile());

		const failureFile = path.join(__dirname, './html', 'setupSuccess.html');
		const message = template.render(failureFile, { version });

		return sendMail(options, 'Mail Notification Activated', message);
	});

	return function sendMailSetupSuccessMessage() {
		return _ref4.apply(this, arguments);
	};
})();

let sendTelegramSetupSuccessMessage = (() => {
	var _ref5 = _asyncToGenerator(function* () {
		const options = cache.load($.selectCacheFile());

		const plotFinishedFile = path.join(__dirname, './markdown', 'setupSuccess.md');
		const message = template.render(plotFinishedFile);

		return sendTelegram(options, message);
	});

	return function sendTelegramSetupSuccessMessage() {
		return _ref5.apply(this, arguments);
	};
})();

let sendTelegramSinglePlotCompleted = (() => {
	var _ref6 = _asyncToGenerator(function* (options, data) {

		const plotFinishedFile = path.join(__dirname, './markdown', 'singlePlotFinished.md');
		const message = template.render(plotFinishedFile, data);

		return sendTelegram(options, message);
	});

	return function sendTelegramSinglePlotCompleted(_x7, _x8) {
		return _ref6.apply(this, arguments);
	};
})();

let sendTelegramAllPlotsCompleted = (() => {
	var _ref7 = _asyncToGenerator(function* (options, data) {

		const plotFinishedFile = path.join(__dirname, './markdown', 'allPlotsFinished.md');
		const message = template.render(plotFinishedFile, data);

		return sendTelegram(options, message);
	});

	return function sendTelegramAllPlotsCompleted(_x9, _x10) {
		return _ref7.apply(this, arguments);
	};
})();

let sendTelegramFailure = (() => {
	var _ref8 = _asyncToGenerator(function* (options, data) {

		const plotFinishedFile = path.join(__dirname, './markdown', 'failure.md');
		const message = template.render(plotFinishedFile, data);

		return sendTelegram(options, message);
	});

	return function sendTelegramFailure(_x11, _x12) {
		return _ref8.apply(this, arguments);
	};
})();

let sendSinglePlotCompleted = (() => {
	var _ref10 = _asyncToGenerator(function* () {
		const options = cache.load($.selectCacheFile());
		const totalEstimatedDurationInSecs = $.selectTotalEstimatedDurationInSecs();
		const etaDate = addSeconds(Date.now(), totalEstimatedDurationInSecs);

		const data = {
			version,
			currentPlot: $.selectCurrentPlotIndex(),
			plotCount: $.selectPlotCount(),
			writtenNonces: $.selectCurrentPlotWrittenNonces(),
			duration: formatTimeString($.selectElapsedTimeInSecs()),
			noncesPerMin: $.selectEffectiveNoncesPerSeconds() * 60,
			eta: formatDate(etaDate, "DD/MM/YYYY HH:mm:ss")
		};

		return __send('singlePlotCompleted', options, data);
	});

	return function sendSinglePlotCompleted() {
		return _ref10.apply(this, arguments);
	};
})();

let sendAllPlotsCompleted = (() => {
	var _ref11 = _asyncToGenerator(function* () {
		const options = cache.load($.selectCacheFile());

		const data = {
			version,
			plotCount: $.selectPlotCount(),
			outputPath: $.selectOutputPath(),
			writtenNonces: $.selectTotalWrittenNonces(),
			duration: formatTimeString($.selectElapsedTimeInSecs()),
			noncesPerMin: $.selectEffectiveNoncesPerSeconds() * 60
		};

		return __send('allPlotsCompleted', options, data);
	});

	return function sendAllPlotsCompleted() {
		return _ref11.apply(this, arguments);
	};
})();

let sendFailure = (() => {
	var _ref12 = _asyncToGenerator(function* (error) {
		const options = cache.load($.selectCacheFile());

		const data = {
			version,
			error
		};

		return __send('failure', options, data);
	});

	return function sendFailure(_x16) {
		return _ref12.apply(this, arguments);
	};
})();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const path = require('path');
const sendMail = require('./sendMail');
const sendTelegram = require('./sendTelegram');
const template = require('./template');
const $ = require('../selectors');
const { version } = require('../../package.json');
const cache = require('../cache');
const { formatTimeString } = require('../utils');
const { addSeconds, format: formatDate } = require("date-fns");

const __sendFunctions = {
	singlePlotCompleted: [sendMailSinglePlotCompleted, sendTelegramSinglePlotCompleted],
	allPlotsCompleted: [sendMailAllPlotsCompleted, sendTelegramAllPlotsCompleted],
	failure: [sendMailFailure, sendTelegramFailure]
};

const __send = (() => {
	var _ref9 = _asyncToGenerator(function* (type, options, data) {
		return __sendFunctions[type].forEach(function (fn) {
			return fn(options, data);
		});
	});

	return function __send(_x13, _x14, _x15) {
		return _ref9.apply(this, arguments);
	};
})();

module.exports = {
	sendSinglePlotCompleted,
	sendAllPlotsCompleted,
	sendFailure,
	sendTelegramSetupSuccessMessage,
	sendMailSetupSuccessMessage
};