const nodemailer = require('nodemailer');

function sendMail(options, subject, htmlMessage){
	
	if(!options.email.enabled) return;
	
	const transporter = nodemailer.createTransport(options.smtp);

	const mailOptions = {
		from : "noreply@burst-autoplotter.org",
		to: options.email.address,
		subject: `💌 Autoplotter - Notification: ${subject}`,
		html: htmlMessage
	};
	
	transporter.sendMail(mailOptions);
	
}


module.exports = sendMail;