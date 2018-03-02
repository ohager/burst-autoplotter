const blessed = require("blessed");
const $ = require("../../selectors");

class ScoopsView {

	constructor() {

		this.boxElement = blessed.box({
			top: 22,
			left: 'center',
			width: '100%',
			height: 5,
			tags: true,
			label: { text: `Writing Scoops`, side: 'left' },
			border: {
				type: 'line'
			},
			style: {
				fg: 'blue',
				bg: 'black',
				border: {
					fg: 'blue'
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
			border: {
				type: 'line'
			},
			style: {
				bold: true,
				fg: 'white',
				bg: 'black',
				bar: {
					bg: 'black',
					fg: 'white'
				}
			},
			ch: '='
		});
	}

	get element() {
		return this.boxElement;
	}

	update() {
		this.updateBox();
		this.updateProgressBar();
	}

	updateProgressBar() {
		this.progressElement.setProgress($.selectScoopPercentage());
	}

	updateBox() {
		const isWritingScoops = $.selectIsWritingScoops();

		const labelText = `Scoops - ${isWritingScoops ? `Writing...${$.selectScoopPercentage()}%` : "Idle"}`;
		this.element.setLabel({ text: labelText, side: "left" });
		this.element.style.border.bold = isWritingScoops;
		this.progressElement.style.bar.bold = isWritingScoops;
		this.progressElement.style.border.bold = isWritingScoops;

		const color = 'white'; //isWritingScoops ? 'yellow' : 'blue';
		this.element.style.border.fg = color;
		this.progressElement.style.bar.fg = color;
		this.progressElement.style.border.fg = color;
	}
}

module.exports = ScoopsView;