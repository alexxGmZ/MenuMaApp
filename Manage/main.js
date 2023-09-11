// Queue Mode
// Facilitates order queues

const { app, BrowserWindow } = require('electron');
const menumaapp_api = require("./public/js/api.js");

const createWindow = () => {
	const win = new BrowserWindow({
		width: 1280,
		height: 720,
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false,
			enableRemoteModule: true,
		}
	})

	win.loadFile('./public/main.html')
}

app.whenReady().then(() => {
	// createWindow()
})
