var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

const store = require('../store');

function handleClose(code) {

	// complete plot status!
	store.update(state => {
		const remainingNonces = state.currentPlot.nonces - state.currentPlot.writtenNonces;
		return {
			scoopPercentage: 0,
			totalWrittenNonces: state.totalWrittenNonces + remainingNonces,
			currentPlot: _extends({}, state.currentPlot, {
				writtenNonces: state.currentPlot.nonces
			})
		};
	});
}

module.exports = handleClose;