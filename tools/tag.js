const {writeJson} = require('fs-extra');
const {prompt} = require('inquirer');
const path = require("path");
const {spawn} = require('child_process');
const semver = require('semver');
const packageJson = require('../package.json');
const {version} = packageJson;

const STDIO_OPTIONS = {stdio: 'inherit'};
const PACKAGE_JSON_FILE = path.join(__dirname, '../package.json');

const exep = (cmd, args) => new Promise((resolve, reject) => {
	const process = spawn(cmd, args);
	process.on('close', (code) => {
		if (code !== 0) {
			reject("Ooops, something failed");
		}
		else {
			resolve();
		}
	})
});

const updatePackageJson = version => {
	packageJson.version = version;
	return writeJson(PACKAGE_JSON_FILE, packageJson, {spaces: '\t'});
};

const gitCommit = message => exep('git', [
	'commit',
	'-am', message,
], STDIO_OPTIONS);

const gitPush = () => exep('git', [
	'push',
], STDIO_OPTIONS);

const gitNewTag = version => exep('git', [
	'tag',
	version[0] === 'v' ? version : 'v' + version,
], STDIO_OPTIONS);

const gitPushTag = () => exep('git', [
	'push',
	'origin',
	'--tags',
], STDIO_OPTIONS);


(function () {
	
	const defaultVersion = semver.inc(version, 'patch');
	let nextVersion = defaultVersion;
	prompt([{
		type: "input",
		name: "selectedVersion",
		message: "What's the next version?",
		validate: v => {
			if (!semver.valid(v)) return "Choose a valid semantic version, dude!";
			if (semver.lt(v, version)) return `Version must be greater than ${version}`;
			return true;
		},
		default: defaultVersion
	}])
		.then(({selectedVersion}) => {
			nextVersion = selectedVersion;
			return updatePackageJson(nextVersion);
		})
		.then(() => gitCommit(`Releasing new version ${nextVersion}`))
		.then(() => gitPush())
		.then(() => gitNewTag(nextVersion))
		.then(() => gitPushTag())
		.catch(e => {
			console.error("FUCK, didn't work: " + e);
		});
})();