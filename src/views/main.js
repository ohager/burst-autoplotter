const store = require('../store');
const $ = require('../selectors');

let listener = null;

function start () {
	listener = store.listen( updateView );
}

function stop() {
	if(listener) store.unlisten(listener);
}

function updateView( ) {
	
	const npm = $.selectTotalNoncesPerMin();
	/*
	process.stdout.clearLine();
	process.stdout.cursorTo(0);
	process.stdout.write( "nonces per minute: " + npm )
	*/
	
	console.log(store.get());
	
}

// TODO: see what'll be the trigger

module.exports = {
	start,
	stop
};

