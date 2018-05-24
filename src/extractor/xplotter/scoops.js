const extract = require("../extract");

const WritingScoopsRegex = /scoops: (.+)%/g;

const getWritingScoops = input => extract(WritingScoopsRegex, input);

module.exports = {
	getWritingScoops,
};
