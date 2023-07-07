// Queue Mode
// Facilitates order queues

const { app, BrowserWindow } = require('electron')

const createWindow = () => {
	const win = new BrowserWindow({
		width: 800,
		height: 600
	})

	win.loadFile('./public/main.html')
}

app.whenReady().then(() => {
	createWindow()
})
