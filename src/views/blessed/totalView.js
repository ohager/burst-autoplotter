const blessed = require("blessed");
const {normalizeProgress, formatTimeString} = require("../../utils");
const $ = require("../../selectors");
const {addSeconds, format} = require("date-fns");

class TotalView {
	
	constructor() {
		
		this.boxElement = blessed.box({
			top: 6,
			left: 'center',
			width: '100%',
			height: 6,
			tags: true,
			label: {text: `Overall Progress`, side: 'left'},
			border: {
				type: 'line'
			},
			style: {
				fg: 'green',
				bg: 'black',
				border: {
					fg: '#ffffff'
				},
				hover: {
					bg: 'green'
				}
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
					fg: 'blue',
					bg: 'black',
					bar: {
						bg: 'blue',
						fg: 'blue'
					},
					border: {
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
				bg: 'black',
				border: {
					fg: '#ffffff'
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
		
		const totalNonces = $.selectTotalNonces();
		const totalWrittenNonces = $.selectTotalWrittenNonces();
		const progress = Math.min(normalizeProgress(0, totalNonces, totalWrittenNonces, 100), 100);
		
		const colorProgress = Math.min(normalizeProgress(0,100,progress,3),3);
		const barColors = ['red', 'yellow', 'green', 'lightgreen'];
		
		this.progressElement.style.bar = { bg: barColors[colorProgress] };
		this.progressElement.setProgress(progress);
	}
	
	updateBox() {
		const totalNonces = $.selectTotalNonces();
		const totalWrittenNonces = $.selectTotalWrittenNonces();
		const noncesPerMinute = $.selectEffectiveNoncesPerSeconds() * 60;
		const labelText = `Overall Progress [${totalWrittenNonces}/${totalNonces}] - {yellow-fg}${noncesPerMinute} nonces/min{/}`;
		this.element.setLabel({text: labelText, side: "left"});
	}
	
	updateRemaining() {
		const totalEstimatedDurationInSecs = $.selectTotalEstimatedDurationInSecs();
		const eta = totalEstimatedDurationInSecs ? addSeconds(Date.now(), totalEstimatedDurationInSecs) : null;
		const text = `Remaining Time: {white-fg}${formatTimeString(totalEstimatedDurationInSecs)}{/}\tETA {white-fg}${eta ? format( eta, "DD-MM-YYYY HH:mm:ss") : "N/A"}{/}`;
		this.remainingTextElement.setLine(0, text);
	}
}

module.exports = TotalView;