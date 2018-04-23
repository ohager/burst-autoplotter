let send = (() => {
	var _ref = _asyncToGenerator(function* (options, text) {

		if (!options.telegram.enabled) return;

		return http.post("/api/messages", {
			"recipient_token": options.telegram.token,
			"text": text,
			"origin": "BURST Autoplotter"
		});
	});

	return function send(_x, _x2) {
		return _ref.apply(this, arguments);
	};
})();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const axios = require("axios");

const http = axios.create({
	baseURL: 'https://middleman.ferdinand-muetsch.de',
	headers: { 'Content-Type': 'application/json' }
});

module.exports = send;