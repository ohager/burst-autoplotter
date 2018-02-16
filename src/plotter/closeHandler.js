const store = require('../store');
const $ = require("../selectors");

function handleClose(code) {

	// complete plot status!
	store.update(state => {
		const remainingNonces = state.currentPlot.nonces - state.currentPlot.writtenNonces;
		return {
			totalWrittenNonces: state.totalWrittenNonces + remainingNonces,
			currentPlot: {
				...state.currentPlot,
				writtenNonces: state.currentPlot.nonces,
			}
		}
	});
}

module.exports = handleClose;