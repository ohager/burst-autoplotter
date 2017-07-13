const jsonFile = require('jsonfile');
const fs = require('fs');
const DefaultCacheFile = process.env.CACHE_FILE;

const initialCacheData = {
	accountId : "",
	lastNonce : 0
};

const cacheableProps = Object.keys(initialCacheData);

const guaranteeExistance = (file) => {
	if (!fs.existsSync(file)) {
		jsonFile.writeFileSync(file,initialCacheData);
	}
	return file;
};

const _load = (file = DefaultCacheFile) => jsonFile.readFileSync(guaranteeExistance(file));
function _update(obj, file = DefaultCacheFile) {
	const cache = _load(file);
	
	let isDirty = false;
	
	let updatedCache;
	for (let i = 0; i < cacheableProps.length; ++i) {
		const prop = cacheableProps[i];

		if (obj[prop] === undefined) continue;
		
		updatedCache = Object.assign(cache, {
			[prop]: obj[prop]
		});
		isDirty = true;
	}
	
	if (isDirty) {
		jsonFile.writeFileSync(file, updatedCache, {spaces: 2});
	}
}

module.exports = {
	load: _load,
	update: _update
};