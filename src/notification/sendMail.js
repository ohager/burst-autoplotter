const nodemailer = require('nodemailer');
const store = require('../store');
const mustache = require('mustache');

function sendMail(options, subject, htmlMessage){
	
	if(!options.email.enabled) return;
	
	const transporter = nodemailer.createTransport(options.smtp);

	const mailOptions = {
		from : "autoplotter@burstcoin.com",
		to: options.email.address,
		subject: `💌 Autoplotter - Notification: ${subject}`,
		html: htmlMessage
	};
	
	transporter.sendMail(mailOptions);
	
}


module.exports = sendMail;