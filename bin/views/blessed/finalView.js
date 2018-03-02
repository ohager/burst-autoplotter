const blessed = require("blessed");
const { formatTimeString } = require("../../utils");
const $ = require("../../selectors");

class FinalView {
	constructor() {

		this.box = blessed.box({
			hidden: true,
			top: 'center',
			left: 'center',
			width: 'shrink',
			height: 'shrink',
			padding: {
				top: 1,
				right: 2,
				bottom: 1,
				left: 2
			},
			tags: true,
			keys: true,
			mouse: true,
			label: { text: `Finished`, side: 'left' },
			border: {
				type: 'line',
				fg: 'green'
			},
			style: {
				fg: 'white',
				bg: 'green'
			}
		});

		this.box.setIndex(100);
	}

	get element() {
		return this.box;
	}

	setErrorContent() {
		let line = 0;
		let e = this.element;

		e.setLabel({ text: 'Error', side: 'left' });
		e.border.fg = 'red';
		e.style.bg = 'red';

		e.setLine(line, '{bold}DOH - Something went wrong{/}');
		e.setLine(++line, $.selectError());
		e.setLine(++line, "");
		e.setLine(++line, "{bold}Press [ESC] to close{/}");
	}

	setSuccessContent() {
		let line = 0;
		let e = this.element;

		e.setLabel({ text: 'Finished', side: 'left' });
		e.border.fg = 'green';
		e.style.bg = 'green';

		e.setLine(line, '{bold}{yellow-fg}YAY - Plotting finished successfully{/}');
		e.setLine(++line, "");
		e.setLine(++line, `Total Plot Size: ${$.selectTotalPlotSizeInGiB()} GiB`);
		e.setLine(++line, `Plots created: ${$.selectPlotCount()}`);
		e.setLine(++line, `Total nonces written: ${$.selectTotalNonces()}`);
		e.setLine(++line, `Elapsed Time: ${formatTimeString($.selectElapsedTimeInSecs())}`);
		e.setLine(++line, `Plots path: ${$.selectOutputPath()}`);
		e.setLine(++line, `Nonces/min: ${$.selectEffectiveNoncesPerSeconds() * 60}`);
		e.setLine(++line, "");
		e.setLine(++line, "{bold}Press [ESC] to close{/}");
	}

	update() {

		if (!$.selectHasFinished()) return;

		if ($.selectHasError()) {
			this.setErrorContent();
		} else {
			this.setSuccessContent();
		}

		this.element.focus();
		this.element.show();
	}
}

module.exports = FinalView;