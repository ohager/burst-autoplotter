const { CACHE_FILE } = require('./config');
const fs = require('fs-extra');
const path = require('path');

const initialCacheData = {
	accountId: "1234567890123456789",
	lastNonce: 0
};
const defaultCacheFile = path.join(process.env.APPDATA, CACHE_FILE);

const cacheableProps = Object.keys(initialCacheData);

const guaranteeExistance = file => {
	if (!fs.existsSync(file)) {
		fs.writeJsonSync(file, initialCacheData);
	}
	return file;
};

const load = (file = defaultCacheFile) => fs.readJsonSync(guaranteeExistance(file));

function update(obj, file = defaultCacheFile) {

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
		fs.writeJsonSync(file, updatedCache, { spaces: 2 });
	}
}

module.exports = {
	load,
	update
};