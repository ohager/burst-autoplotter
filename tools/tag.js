const PACKAGE_JSON_FILE = '../package.json';

const prompt = require('inquirer').prompt;
const semver = require('semver');
const {promisify} = require('util');
const {writeJson} = require('fs-extra');
const packageJson = require(PACKAGE_JSON_FILE);
const {version} = packageJson;
const {spawn} = require('child_process');

const STDIO_OPTIONS = {stdio: 'inherit'};

const updatePackageJson = version => {
	packageJson.version = version;
	return writeJson(PACKAGE_JSON_FILE, packageJson, {spaces: '\t'});
};

const gitCommit = message => promisify(spawn('git', [
	'commit',
	'-am', message,
], STDIO_OPTIONS));

const gitPush = () => promisify(spawn('git', [
	'push',
], STDIO_OPTIONS));

const gitNewTag = version => promisify(spawn('git', [
	'tag',
	version[0] === 'v' ? version : 'v' + version,
], STDIO_OPTIONS));

const gitPushTag = () => promisify(spawn('git', [
	'push',
	'origin',
	'--tags',
], STDIO_OPTIONS));


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
/*
	.then(() => gitPush())
	.then(() => gitNewTag(nextVersion))
	.then(() => gitPushTag())
*/
	.catch(e => {
		console.error("FUCK, didn't work: " + e);
	});
})();