const path = require('path');
const sendMail = require('./sendMail');
const template = require('./template');
const $ = require('../selectors');
const {version} = require('../../package.json');
const cache = require('../cache');
const {formatTimeString} = require('../utils');
const { addSeconds, format : formatDate } = require("date-fns");

function sendMailSinglePlotFinished(){

	const options = cache.load($.selectCacheFile());
	const plotFinishedFile = path.join(__dirname, './html', 'singlePlotFinished.html');
	const totalEstimatedDurationInSecs = $.selectTotalEstimatedDurationInSecs();
	const etaDate = addSeconds(Date.now(), totalEstimatedDurationInSecs);
	
	const data = {
		version,
		currentPlot : $.selectCurrentPlotIndex(),
		plotCount : $.selectPlotCount(),
		writtenNonces : $.selectCurrentPlotWrittenNonces(),
		duration: formatTimeString($.selectElapsedTimeInSecs()),
		noncesPerMin : $.selectEffectiveNoncesPerSeconds() * 60,
		eta: formatDate(etaDate, "DD/MM/YYYY HH:mm:ss"),
	};
	
	const message = template.render(plotFinishedFile, data);
	
	sendMail(options, `🍻 Plot ${data.currentPlot}/${data.plotCount} finished`, message);
}

function sendMailAllPlotsCompleted(){
	const options = cache.load($.selectCacheFile());
	const allPlotsFinishedFile = path.join(__dirname, './html', 'allPlotsFinished.html');
	
	const data = {
		version,
		plotCount : $.selectPlotCount(),
		outputPath: $.selectOutputPath(),
		writtenNonces : $.selectTotalWrittenNonces(),
		duration: formatTimeString($.selectElapsedTimeInSecs()),
		noncesPerMin : $.selectEffectiveNoncesPerSeconds() * 60,
	};
	
	const message = template.render(allPlotsFinishedFile, data);
	
	sendMail(options, '🎉 Finally, plotting completed', message);

}


function sendMailFailure(error){

}


module.exports = {
	sendMailSinglePlotFinished,
	sendMailAllPlotsCompleted,
	sendMailFailure,
};