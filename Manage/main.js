// Queue Mode
// Facilitates order queues

const { app, BrowserWindow } = require('electron')

const createWindow = () => {
	const win = new BrowserWindow({
		width: 1280,
		height: 720
	})

	win.loadFile('./public/main.html')
}

app.whenReady().then(() => {
	createWindow()
})
