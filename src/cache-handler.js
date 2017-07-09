const jsonFile = require("jsonfile");

const DEFAULT_FILENAME = "./.cache";

const cacheableProps = [
	'accountId',
	'lastNonce'
];

const _load = (file = DEFAULT_FILENAME) => jsonFile.readFileSync(file);

function _update(cache, obj, file = DEFAULT_FILENAME) {
	let isDirty = false;
	
	let updatedCache;
	for (let i = 0; i < cacheableProps.length; ++i) {
		const prop = cacheableProps[i];
		if (obj[prop]) {
			updatedCache = Object.assign({}, cache,
				{
					[prop]: obj[prop]
				});
			isDirty = true;
		}
	}
	
	if (isDirty){
		jsonFile.writeFileSync(file, updatedCache, {spaces: 2});
	}
}

module.exports = {
	load: _load,
	update: _update
};