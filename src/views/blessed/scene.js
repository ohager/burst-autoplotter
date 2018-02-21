const blessed = require("blessed");
const {version} = require("../../../package.json");

class Scene {
	
	constructor() {
		
		this.views = {};
		
		this.screen = blessed.screen({
				smartCSR: true,
				terminal: "windows-ansi",
				title: `BURST Auto plotter ${version}`,
				cursor: {
					artificial: true,
					shape: 'line',
					blink: false,
				},
				debug: process.env.NODE_ENV === "development"
			}
		);
		
		
		// Quit on Escape, q, or Control-C.
		this
			.screen
			.key(['escape', 'q', 'C-c'],
				
				(ch
					,
                 key) => {
					// todo: Ask to quit
					this
						.screen
						.destroy();
					
					return
					process
						.exit(
							0
						)
					;
				}
			)
		;
	}
	
	addView(name, viewClass) {
		const newView = new viewClass();
		this.screen.append(newView.element);
		this.views[name] = newView;
	}
	
	view(name) {
		return this.views[name];
	}
	
	render() {
		
		Object.getOwnPropertyNames(this.views).forEach(p => {
			this.views[p].update();
		});
		this.screen.render();
	}
	
	destroy() {
		this.screen.destroy();
		this.views = {};
	}
}

module.exports = Scene;