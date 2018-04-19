const path = require('path');
const sendMail = require('./sendMail');
const sendTelegram = require('./sendTelegram');
const template = require('./template');
const $ = require('../selectors');
const {version} = require('../../package.json');
const cache = require('../cache');
const {formatTimeString} = require('../utils');
const {addSeconds, format: formatDate} = require("date-fns");

async function sendMailSinglePlotCompleted(options, data) {
	
	const plotFinishedFile = path.join(__dirname, './html', 'singlePlotFinished.html');
	const message = template.render(plotFinishedFile, data);
	
	return sendMail(options, `🍻 Plot ${data.currentPlot}/${data.plotCount} finished`, message);
}

async function sendMailAllPlotsCompleted(options, data) {

	const allPlotsFinishedFile = path.join(__dirname, './html', 'allPlotsFinished.html');
	const message = template.render(allPlotsFinishedFile, data);
	
	return sendMail(options, '🎉 Finally, plotting completed', message);
	
}

async function sendMailFailure(options, data) {
	
	const failureFile = path.join(__dirname, './html', 'failure.html');
	const message = template.render(failureFile, data);
	
	return sendMail(options, '😭 Oh no. Something went wrong', message);
	
}

async function sendMailSetupSuccessMessage(){
	const options = cache.load($.selectCacheFile());
	
	const failureFile = path.join(__dirname, './html', 'setupSuccess.html');
	const message = template.render(failureFile, {version});
	
	return sendMail(options, 'Mail Notification Activated', message);

}

async function sendTelegramSetupSuccessMessage(){
	const options = cache.load($.selectCacheFile());
	
	const plotFinishedFile = path.join(__dirname, './markdown', 'setupSuccess.md');
	const message = template.render(plotFinishedFile);
	
	return sendTelegram(options, message);
}

async function sendTelegramSinglePlotCompleted(options, data) {
	
	const plotFinishedFile = path.join(__dirname, './markdown', 'singlePlotFinished.md');
	const message = template.render(plotFinishedFile, data);
	
	return sendTelegram(options, message);
}

async function sendTelegramAllPlotsCompleted(options, data) {

	const plotFinishedFile = path.join(__dirname, './markdown', 'allPlotsFinished.md');
	const message = template.render(plotFinishedFile, data);

	return sendTelegram(options, message);

}

async function sendTelegramFailure(options, data) {

	const plotFinishedFile = path.join(__dirname, './markdown', 'failure.md');
	const message = template.render(plotFinishedFile, data);
	
	return sendTelegram(options, message);

}

const __sendFunctions = {
	singlePlotCompleted: [sendMailSinglePlotCompleted, sendTelegramSinglePlotCompleted],
	allPlotsCompleted: [sendMailAllPlotsCompleted, sendTelegramAllPlotsCompleted],
	failure: [sendMailFailure, sendTelegramFailure],
};

const  __send = async (type, options, data) => __sendFunctions[type].forEach(fn => fn(options, data));

async function sendSinglePlotCompleted() {
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
		eta: formatDate(etaDate, "DD/MM/YYYY HH:mm:ss"),
	};
	
	return __send('singlePlotCompleted', options, data);
	
}

async function sendAllPlotsCompleted() {
	const options = cache.load($.selectCacheFile());
	
	const data = {
		version,
		plotCount: $.selectPlotCount(),
		outputPath: $.selectOutputPath(),
		writtenNonces: $.selectTotalWrittenNonces(),
		duration: formatTimeString($.selectElapsedTimeInSecs()),
		noncesPerMin: $.selectEffectiveNoncesPerSeconds() * 60,
	};
	
	return __send('allPlotsCompleted', options, data);
	
}

async function sendFailure(error) {
	const options = cache.load($.selectCacheFile());

	const data = {
		version,
		error
	};
	
	return __send('failure', options, data);
	
}


module.exports = {
	sendSinglePlotCompleted,
	sendAllPlotsCompleted,
	sendFailure,
	sendTelegramSetupSuccessMessage,
	sendMailSetupSuccessMessage,
};
