const PACKAGE_JSON_FILE = '../package.json';

const prompt = require('inquirer').prompt;
const semver = require('semver');
const {writeJsonSync} = require('fs-extra');
const packageJson = require(PACKAGE_JSON_FILE);
const {version} = packageJson;
const {spawnSync} = require('child_process');

function gitCommit(message){
	const process = spawnSync('git', [
		'commit',
		'-am', message,
	], {stdio:'inherit'});
}

(function () {
	
	const newVersion = semver.inc(version, 'patch');
	prompt([
		{
			type: "input",
			name: "nextVersion",
			message: "What's the next version?",
			validate: v => {
				if (!semver.valid(v)) return "Choose a valid semantic version, dude!";
				if (semver.lt(v, version)) return `Version must be greater than ${version}`;
				return true;
			},
			default: newVersion
		}
	]).then(({nextVersion}) => {
			packageJson.version = nextVersion;
			writeJsonSync(PACKAGE_JSON_FILE, packageJson, {spaces: '\t'});
			gitCommit(`Releasing new version ${nextVersion}`);
		}
	).catch( e => {
		console.error("FUCK, didn't work: " + e);
	});
	
})();