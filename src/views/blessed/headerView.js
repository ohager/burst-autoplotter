const blessed = require("blessed");
const {formatTimeString} = require("../../utils");
const $ = require("../../selectors");

const {version, author} = require("../../../package.json");

class HeaderView {
	constructor() {
		
		this.box = blessed.box({
			top: 'top',
			left: 'center',
			width: '100%',
			height: '20%',
			tags: true,
			label: {text: `BURST Autoplotter ${version} by ${author.name}`, side: 'left'},
			border: {
				type: 'line'
			},
			style: {
				fg: 'yellow',
				bg: 'black',
				border: {
					fg: '#ffffff'
				},
			}
		});
	}

	get element() { return this.box; }
	
	update() {
		
		//const instructionSet = $.selectInstructionSet();
		//const threads = $.selectUsedThreads();
		//const memoryInMiB = $.selectUsedMemory();
		const totalPlotSizeInGiB = $.selectTotalPlotSizeInGiB();
		const plotCount = $.selectPlotCount();
		const totalNonces = $.selectTotalNonces();
		const elapsed = $.selectElapsedTimeInSecs();
		
		let line = 0;
		this.element.setLine(line, `Partition: {white-fg}${totalPlotSizeInGiB}{/} GiB in {white-fg}${plotCount}{/} plot(s)`);
		this.element.setLine(++line, `Total nonces to be written: {white-fg}${totalNonces}{/}`);
		this.element.setLine(++line, `Elapsed Time: {white-fg}${formatTimeString(elapsed)}{/}`);
	}
}

module.exports = HeaderView;