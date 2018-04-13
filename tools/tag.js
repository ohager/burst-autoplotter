const {writeJson} = require('fs-extra');
const {prompt} = require('inquirer');
const path = require("path");
const {spawn} = require('child_process');
const semver = require('semver');
const packageJson = require('../package.json');
const {version} = packageJson;

const STDIO_OPTIONS = {stdio: 'inherit'};
const PACKAGE_JSON_FILE = path.join(__dirname, '../package.json');

const exep = (cmd, args, opts) => new Promise((resolve, reject) => {
	console.log(`Executing ${cmd} ${args.join(" ")}`);
	const process = spawn(cmd, args, opts);
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

const objToArray = (obj) => Object.keys(obj).reduce((acc, arg) => {
	acc.push(obj[arg]);
	return acc;
}, []);

const git = function () {
	return exep('git', objToArray(arguments), STDIO_OPTIONS)
};

const gitAddAll = () => git('add', '-A');

const gitCommit = message => git('commit', '-am', message);

const gitPush = () => git('push');

const gitNewTag = version => git('tag', version[0] === 'v' ? version : 'v' + version);

const gitPushTag = () => git('push', 'origin', '--tags');


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
		.then(() => gitAddAll())
		.then(() => gitCommit(`Releasing new version ${nextVersion}`))
		.then(() => gitPush())
		.then(() => gitNewTag(nextVersion))
		.then(() => gitPushTag())
		.catch(e => {
			console.error("FUCK, didn't work: " + e);
		});
})();
