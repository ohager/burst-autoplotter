const fs = require('fs');
const mustache = require('mustache');

function render(templateFile, model){
	const template = fs.readFileSync(templateFile).toString();
	return mustache.render(template, model)
}

module.exports = {
	render
};