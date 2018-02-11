module.exports = function(regex, str){
	
	const matches = regex.exec(str);
	if(!matches) {
		return null;
	}
	
	let groups = {};
	matches.forEach((match, groupIndex) => groups[`$${groupIndex}`] = match );
	return groups;
};
