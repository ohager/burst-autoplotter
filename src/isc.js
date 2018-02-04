const path  = require('path');
const { spawnSync } = require('child_process');

const checker = path.join(__dirname, "../exe", './checkInstructionSet.bat');

function _checkInstructionSet(){
	try {
		const result = spawnSync(checker, {cwd:path.join(__dirname, "../exe")});
		const text = result.output.toString();
		
		return {
			sse : /SSE supported/.test(text),
			sse2 : /SSE supported/.test(text),
			avx : /AVX supported/.test(text),
			avx2 : /AVX2 supported/.test(text)
		};
	}
	catch(e){
		return null;
	}
}

module.exports = {
	checkInstructionSet : _checkInstructionSet
};