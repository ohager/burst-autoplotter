

let metrics = {
	noncesPerMin: 0,
	currentPlot: {
		remainingNonces: 0,
		totalNonces: 0,
		percentage: 0.0
	},
	remainingNonces: 0,
	totalNonces: 0,
	percentage: 0.0,
	durationEstimate: 0, // in secs
	eta: null // date object

};

module.exports = metrics;