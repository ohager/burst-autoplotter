const axios = require("axios");

const http = axios.create({
	baseURL: 'https://middleman.ferdinand-muetsch.de',
	headers: {'Content-Type': 'application/json'},
});

async function send(options, text) {
	
	if (!options.telegram.enabled) return;
	
	return http.post("/api/messages",
		{
			"recipient_token": options.telegram.token,
			"text": text,
			"origin": "BURST Autoplotter"
		}
	)
}

module.exports = send;
