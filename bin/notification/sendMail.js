let send = (() => {
	var _ref = _asyncToGenerator(function* (options, subject, htmlMessage) {

		if (!options.email.enabled) return;

		const transporter = nodemailer.createTransport(options.smtp);

		const mailOptions = {
			from: "noreply@burst-autoplotter.org",
			to: options.email.address,
			subject: `💌 Autoplotter - Notification: ${subject}`,
			html: htmlMessage
		};

		return transporter.sendMail(mailOptions);
	});

	return function send(_x, _x2, _x3) {
		return _ref.apply(this, arguments);
	};
})();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const nodemailer = require('nodemailer');

module.exports = send;