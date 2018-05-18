const blessed = require("blessed");
const { normalizeProgress, formatTimeString } = require("../../utils");
const $ = require("../../selectors");
const { addSeconds, format } = require("date-fns");

class TotalView {

	constructor() {

		this.boxElement = blessed.box({
			top: 28,
			left: 'center',
			width: '100%',
			height: 6,
			tags: true,
			label: { text: `Move Plot Progress`, side: 'left' },
			border: {
				type: 'line'
			},
			style: {
				bold: false,
				fg: 'green',
				bg: 'black',
				border: {
					bold: false,
					fg: 'white'
				}
			}
		});

		this.progressElement = blessed.progressbar({
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
			ch: ' '
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
				bold: true,
				border: {
					fg: 'white',
					bold: true
				}
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

	isPlottingAndSlowMoving() {
		return $.selectIsPlotting() && $.selectIsMovingSlowerThanPlotting();
	}

	updateProgressBar() {

		const totalMiB = $.selectMovePlotTotalMegabytes();
		const totalCopiedMiB = $.selectMovePlotCopiedMegabytes();
		const progress = Math.min(normalizeProgress(0, totalMiB, totalCopiedMiB, 100), 100);

		this.progressElement.style.bar = {
			bg: this.isPlottingAndSlowMoving() ? 'red' : 'green',
			bold: false
		};
		this.progressElement.setProgress(progress);
	}

	updateBox() {

		const isMovingPlot = $.selectIsMovingPlot();
		this.element.style.border.bold = isMovingPlot;
		this.progressElement.style.bar.bold = isMovingPlot;
		this.progressElement.style.border.bold = isMovingPlot;

		if (!isMovingPlot) return;

		const transferSpeed = $.selectMovePlotTransferSpeed() || "N/A";
		const totalMiB = $.selectMovePlotTotalMegabytes();
		const totalCopiedMiB = $.selectMovePlotCopiedMegabytes();
		let labelText = `Copying [${totalCopiedMiB}/${totalMiB}] - {yellow-fg}${transferSpeed} MiB/sec{/}`;
		if (this.isPlottingAndSlowMoving()) {
			labelText += ` - {red-fg}ATTENTION: Slower than plotting!{/}`;
		}
		this.element.setLabel({ text: labelText, side: "left" });
	}

	updateRemaining() {

		if (!$.selectIsMovingPlot()) return;

		const estimatedDurationInSecs = $.selectMovePlotEstimatedDurationInSecs();
		const eta = estimatedDurationInSecs ? addSeconds(Date.now(), estimatedDurationInSecs) : null;
		const text = `Remaining Time: {white-fg}${formatTimeString(estimatedDurationInSecs)}{/}\tETA {white-fg}${eta ? format(eta, "DD/MM/YYYY HH:mm:ss") : "N/A"}{/}`;
		this.remainingTextElement.setLine(0, text);
	}
}

module.exports = TotalView;