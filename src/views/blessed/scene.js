const blessed = require("blessed");
const $ = require("../../selectors");
const {version} = require("../../../package.json");

let handled = false;

class Scene {
	
	constructor() {
		
		this.autoCloseInterval = null;
		this.views = {};
		this.onExitFn = () => {
		};
		
		this.screen = blessed.screen({
				smartCSR: true,
				terminal: "windows-ansi",
				title: `BURST Auto plotter ${version}`,
				cursor: {
					artificial: true,
					shape: 'line',
					blink: false,
				},
			}
		);
		this.screen.enableInput();
		
		// Quit on Escape, q, or Control-C.
		this.screen.key(['escape', 'q', 'C-c'], () => {
			
			if(this.autoCloseInterval) {
				clearInterval(this.autoCloseInterval);
			}
			
			if ($.selectHasFinished()) {
				this.onExitFn({reason: 'completed', error: $.selectError()});
				return;
			}
			this.showQuitDialog();
		});
		
		process.once('unhandledRejection', (e) => this.__handleException(e));
		
	}
	
	showQuitDialog() {
		
		if (!this.quitDialog) {
			
			this.quitDialog = blessed.box({
				parent: this.screen,
				hidden: false,
				top: 'center',
				left: 'center',
				width: 'shrink',
				height: 5,
				tags: true,
				keys: true,
				mouse: true,
				shadow: true,
				transparent: true,
				label: {text: `Quit?`, side: 'left'},
				border: {
					type: 'line',
					fg: 'red'
				},
				style: {
					fg: 'white',
					bg: 'red',
				}
			});
			
			this.quitDialog.key(['escape', 'n', 'enter', 'y', 'q'], ch => {
				
				switch (ch) {
					case 'q':
					case 'y': {
						this.onExitFn({reason: 'abort'});
						break;
					}
					default: {
						this.quitDialog.hide();
						this.screen.render();
					}
				}
			});
		}
		
		this.quitDialog.focus();
		this.quitDialog.setLine(1, " Do you really want to quit? {grey-fg}(press y/n){/} ");
		this.quitDialog.show();
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
		
		try {
			Object.getOwnPropertyNames(this.views).forEach(p => {
				this.views[p].update();
			});
			
			if (this.quitDialog) {
				this.quitDialog.setFront();
			}
			
			if ($.selectHasFinished() && !this.autoCloseInterval) {
				let remainingSecsUntilClose = 30;
				this.autoCloseInterval = setInterval(() => {
					if(remainingSecsUntilClose-- === 0){
						clearInterval(this.autoCloseInterval);
						this.onExitFn({reason: 'completed', error: $.selectError()});
					}
				},1000)
			}
			
			this.screen.render();
		} catch (e) {
			this.__handleException(e);
		}
		
	}
	
	destroy() {
		this.screen.destroy();
		this.views = {};
	}
	
	onExit(callback) {
		this.onExitFn = callback;
	}
	
	__handleException(e) {
		this.destroy();
		this.onExitFn({reason: 'error', error: e});
	}
}

module.exports = Scene;
