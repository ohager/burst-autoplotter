const blessed = require("blessed");
const {normalizeProgress, formatTimeString, formatDateTime} = require("../../utils");
const $ = require("../../selectors");
const {addSeconds} = require("date-fns");

class TotalView {
	
	constructor() {
		
		this.boxElement = blessed.box({
			top: 15,
			left: 'center',
			width: '100%',
			height: 6,
			tags: true,
			label: {text: `Plot Progress`, side: 'left'},
			border: {
				type: 'line'
			},
			style: {
				fg: 'green',
				bg: 'black',
				bold: true,
				border: {
					fg: 'white',
					bold: true,
				},
			}
		});
		
		this.progressElement = blessed.progressbar(
			{
				parent: this.boxElement,
				filled: 0,
				top: 0, // relative boxElement
				left: 'center',
				tags: true,
				width: "90%",
				height: 3,
				border: 'line',
				style: {
					bold: true,
					fg: 'blue',
					bg: 'black',
					bar: {
						bg: 'blue',
						fg: 'blue'
					},
					border: {
						bold: true,
						fg: 'default',
						bg: 'default'
					}
				},
				ch: ' ',
			});
		
		this.remainingTextElement = blessed.text({
			parent: this.boxElement,
			top: 3,
			left: 'center',
			width: '90%',
			tags: true,
			style: {
				fg: 'yellow',
				bold: true,
				bg: 'black',
				border: {
					fg: 'white',
					bold: true,
				},
			}
		});
	}
	
	
	get element() {
		return this.boxElement;
	}
	
	update() {
		this.updateBox();
		this.updateProgressBar();
		this.updateRemaining();
	}
	
	updateProgressBar() {
		
		const nonces = $.selectCurrentPlotNonces();
		const writtenNonces = $.selectCurrentPlotWrittenNonces();
		const progress = Math.min(normalizeProgress(0, nonces, writtenNonces, 100), 100);
		this.progressElement.setProgress(progress);
	}
	
	updateBox() {
		const plotCount = $.selectPlotCount();
		const currentPlot = $.selectCurrentPlotIndex();
		const nonces = $.selectCurrentPlotNonces();
		const writtenNonces = $.selectCurrentPlotWrittenNonces();
		const labelText = `Plot ${currentPlot}/${plotCount} - Progress [${writtenNonces}/${nonces}]`;
		this.element.setLabel({text: labelText, side: "left"});
	}
	
	updateRemaining() {
		const estimatedDurationInSecs = $.selectCurrentPlotEstimatedDurationInSecs();
		const eta = estimatedDurationInSecs ? addSeconds(Date.now(), estimatedDurationInSecs) : null;
		const text = `Remaining Time: {white-fg}${formatTimeString(estimatedDurationInSecs)}{/}\tETA {white-fg}${eta ? formatDateTime(eta) : "N/A"}{/}`;
		this.remainingTextElement.setLine(0, text);
	}
}

module.exports = TotalView;