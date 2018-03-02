const blessed = require("blessed");
const {formatTimeString} = require("../../utils");
const $ = require("../../selectors");

const {version, author} = require("../../../package.json");

class HeaderView {
	constructor() {
		
		this.box = blessed.box({
			top: 0,
			left: 'center',
			width: '100%',
			height: 6,
			tags: true,
			label: {text: `{bold}BURST Autoplotter ${version} by ${author.name}{/}`, side: 'right'},
			border: {
				type: 'line'
			},
			style: {
				bg: 'black',
				border: {
					fg: 'white',
					bold: true,
				},
			}
		});
		
		const textBaseSettings = {
			parent: this.box,
			top: 0,
			width: '40%',
			tags: true,
			style: {
				fg: 'yellow',
				bold: true,
				bg: 'black',
				border: {
					fg: '#ffffff'
				},
			}
		};
		
		this.leftText = blessed.text({
			...textBaseSettings,
			left: 0,
		});

		this.rightText = blessed.text({
			...textBaseSettings,
			left: '50%+1',
		});
		
	}

	get element() { return this.box; }
	
	update() {
		
		const instructionSet = $.selectInstructionSet();
		const threads = $.selectUsedThreads();
		const memoryInMiB = $.selectUsedMemory();
		const totalPlotSizeInGiB = $.selectTotalPlotSizeInGiB();
		const plotCount = $.selectPlotCount();
		const totalNonces = $.selectTotalNonces();
		const elapsed = $.selectElapsedTimeInSecs();
		const {startNonce, endNonce} = $.selectTotalNonceRange();
		
		let line = 0;
		let target = this.leftText;
		target.setLine(line, `Partition: {white-fg}${totalPlotSizeInGiB}{/} GiB in {white-fg}${plotCount}{/} plot(s)`);
		target.setLine(++line, `Nonce Range: {white-fg}${startNonce}{/} to {white-fg}${endNonce}{/}`);
		target.setLine(++line, `Total nonces to be written: {white-fg}${totalNonces}{/}`);
		target.setLine(++line, `Elapsed Time: {white-fg}${formatTimeString(elapsed)}{/}`);

		line = 0;
		target = this.rightText;
		target.setLine(line, `Used Memory: {white-fg}${memoryInMiB} MiB{/}`);
		target.setLine(++line, `Used Threads: {white-fg}${threads}{/}`);
		target.setLine(++line, `Instruction Set: {white-fg}${instructionSet}{/}`);
	}
}

module.exports = HeaderView;