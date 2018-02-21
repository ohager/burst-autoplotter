const blessed = require("blessed");
const {normalizeProgress} = require("../../utils");
const $ = require("../../selectors");
const {addSeconds} = require("date-fns");

class BodyView {
	
	constructor() {
		
		this.box = blessed.box({
			top: 'center',
			left: 'center',
			width: '100%',
			height: '20%',
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
/*
		this.progressElement = blessed.progressBar(
			{
				parent: this.box,
				filled: 0,
				top: 'center',
				left: 'center',
				width: '100%',
				height: '20%',
				tags: true,
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
			}
		)
		*/
	}
	
	get element() { return this.box; }
	
	update() {
		
		const totalEstimatedDurationInSecs = $.selectTotalEstimatedDurationInSecs();
		const etaTotal = totalEstimatedDurationInSecs ? addSeconds(Date.now(), totalEstimatedDurationInSecs) : null;
		
		const started = $.selectStartTime(); // header?!
		const elapsed = $.selectElapsedTimeInSecs();
		const remaining = totalEstimatedDurationInSecs;
		const eta = etaTotal;
		const totalNonces = $.selectTotalNonces();
		const totalWrittenNonces = $.selectTotalWrittenNonces();
		const noncesPerMinute = $.selectEffectiveNoncesPerSeconds() * 60;
		
		const labelText = `Overall Progress [${totalWrittenNonces}/${totalNonces}]`;
		
		this.element.setLabel({text: labelText, side: "left"});
		
		const progress = Math.min(normalizeProgress(0, 100, totalWrittenNonces, totalNonces), 100);
		
		//this.progressElement.setProgress(progress);
	}
}


module.exports = BodyView;