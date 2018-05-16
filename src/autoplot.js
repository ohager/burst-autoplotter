if(process.platform !== "win32"){
	console.log("Sorry, burst-autoplotter works only on Windows as it uses Blago's XPlotter");
}
require('./command/command').start();
