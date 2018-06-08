const extract = require("../extract");

const WritingScoopsRegex = /WS: (.+)%/g;

const getWritingScoops = input => extract(WritingScoopsRegex, input);

module.exports = {
	getWritingScoops
};