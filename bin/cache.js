const { CACHE_FILE } = require('./config');
const fs = require('fs-extra');
const path = require('path');

const initialCacheData = {
	accountId: "1234567890123456789",
	lastNonce: 0,
	instructionSet: 'SSE',
	telegram: {
		enabled: false,
		uuid: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
	},
	email: {
		enabled: false,
		address: 'yourmail@mailer.com'
	},
	smtp: {
		host: 'smtp.mailtrap.io',
		port: 2525,
		secure: true,
		auth: {
			user: 'user',
			pass: 'password'
		}
	}
};

let rootPath = process.env.APPDATA;
if (process.env.NODE_ENV === "test") {
	rootPath = "./";
}

const defaultCacheFile = path.join(rootPath, CACHE_FILE);

const cacheableProps = Object.keys(initialCacheData);

const guaranteeExistance = file => {
	if (!fs.existsSync(file)) {
		fs.writeJsonSync(file, initialCacheData);
	}
	return file;
};

const load = (file = defaultCacheFile) => fs.readJsonSync(guaranteeExistance(file));

function update(obj, file = defaultCacheFile) {

	const cache = load(file);
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