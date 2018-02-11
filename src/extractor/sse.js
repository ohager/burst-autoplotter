const extract = require("./extract");

// CPU: 4428 nonces done, (9011 nonces/min) - SSE output
const NoncesPerMinRegex = /CPU: (\d+) nonces done, \((\d+) nonces\/min\).*scoops: (.+)%/g;

const getNoncesPerMin = input => getMatchedGroups(NoncesPerMinRegex, input);

module.exports = {
	getNoncesPerMin,
};

