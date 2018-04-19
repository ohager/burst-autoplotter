const nodemailer = require('nodemailer');

async function send(options, subject, htmlMessage){
	
	if(!options.email.enabled) return;
	
	const transporter = nodemailer.createTransport(options.smtp);

	const mailOptions = {
		from : "noreply@burst-autoplotter.org",
		to: options.email.address,
		subject: `💌 Autoplotter - Notification: ${subject}`,
		html: htmlMessage
	};
	
	return transporter.sendMail(mailOptions);
	
}


module.exports = send;
