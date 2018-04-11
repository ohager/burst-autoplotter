const axios = require("axios");

const http = axios.create({
	baseURL: 'https://middleman.ferdinand-muetsch.de',
	headers: {'Content-Type': 'application/json'},
});

function send(options, text) {
	
	if (!options.telegram.enabled) return;
	
	http.post("/api/messages",
		{
			"recipient_token": options.telegram.token,
			"text": text,
			"origin": "BURST Autoplotter"
		}
	)
	.then(response => {
			//TODO log result
	}).catch(error => {
		//FIXME log this error
		// no op yet... ignoring send failure
		console.log("TELEGRAM", error);
	});
	
}

module.exports = send;