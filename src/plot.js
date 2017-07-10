const spawn = require('child_process').spawn;

// -id <ID> -sn <start_nonce> [-n <nonces>] -t <threads> [-path <d:\plots>] [-mem <8G>]
// 1 nonce is 262144 bytes


function _start(args){
	
	const {accountId, startNonce, nonces, threads, path, memory} = args;
	
	const plotterArgs = `-id ${accountId} -sn ${startNonce} -n ${nonces} -t ${threads} -path ${path}`
	
	console.log("Plotting like this:", plotterArgs)

}


module.exports = {
	start : _start
};