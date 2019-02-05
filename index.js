const { app, BrowserWindow, ipcMain } = require('electron');
const ffmpeg = require('fluent-ffmpeg');

let browserWindow;
app.on('ready', () => {
  browserWindow = new BrowserWindow({
    height: 600,
    width: 800,
    webPreferences: {
      backgroundThrottling: false
    }
  });
  browserWindow.loadFile('src/index.html');
});

ipcMain.on('videos:added', (event, videos) => {
  const promise = new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videos[0].path, (err, metadata) => {
      resolve(metadata);
    });
  });

  promise.then((metadata) => console.log(metadata))
})