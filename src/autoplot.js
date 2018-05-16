if(process.platform !== "win32"){
	console.log("Sorry, burst-autoplotter works only on Windows as it uses Blago's XPlotter");
}
else{
	require('./command/command').start();
}
