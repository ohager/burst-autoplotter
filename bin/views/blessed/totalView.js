const blessed = require("blessed");
const { normalizeProgress, formatTimeString } = require("../../utils");
const $ = require("../../selectors");
const { addSeconds, format } = require("date-fns");

class TotalView {

	constructor() {

		this.boxElement = blessed.box({
			top: 7,
			left: 'center',
			width: '100%',
			height: 7,
			tags: true,
			label: { text: `Overall Progress`, side: 'left' },
			border: {
				type: 'line'
			},
			style: {
				bold: true,
				fg: 'green',
				bg: 'black',
				border: {
					bold: true,
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
			height: 4,
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
			top: 4,
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

	updateProgressBar() {

		const totalNonces = $.selectTotalNonces();
		const totalWrittenNonces = $.selectTotalWrittenNonces();
		const progress = Math.min(normalizeProgress(0, totalNonces, totalWrittenNonces, 100), 100);

		this.progressElement.style.bar = {
			bg: 'green',
			bold: true
		};
		this.progressElement.setProgress(progress);
	}

	updateBox() {
		const totalNonces = $.selectTotalNonces();
		const totalWrittenNonces = $.selectTotalWrittenNonces();
		const noncesPerMinute = $.selectEffectiveNoncesPerSeconds() * 60;
		const labelText = `Overall Progress [${totalWrittenNonces}/${totalNonces}] - {yellow-fg}${noncesPerMinute} nonces/min{/}`;
		this.element.setLabel({ text: labelText, side: "left" });
	}

	updateRemaining() {
		const totalEstimatedDurationInSecs = $.selectTotalEstimatedDurationInSecs();
		const eta = totalEstimatedDurationInSecs ? addSeconds(Date.now(), totalEstimatedDurationInSecs) : null;
		const text = `Remaining Time: {white-fg}${formatTimeString(totalEstimatedDurationInSecs)}{/}\tETA {white-fg}${eta ? format(eta, "DD/MM/YYYY HH:mm:ss") : "N/A"}{/}`;
		this.remainingTextElement.setLine(0, text);
	}
}

module.exports = TotalView;