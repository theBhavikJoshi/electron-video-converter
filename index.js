const { app, BrowserWindow, ipcMain, shell } = require('electron');
const ffmpeg = require('fluent-ffmpeg');

let mainWindow;
app.on('ready', () => {
  mainWindow = new BrowserWindow({
    height: 600,
    width: 800,
    webPreferences: {
      backgroundThrottling: false
    }
  });
  mainWindow.loadFile('src/index.html');
});

ipcMain.on('videos:added', (event, videos) => {
  const promises = videos.map(video => {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(video.path, (err, metadata) => {
        resolve({
          ...video,
          duration: metadata.format.duration,
          'format': 'avi'
        });
      });
    });
  });

  Promise.all(promises).then((results) => {
    mainWindow.webContents.send('metadata:complete', results);
  })

});

ipcMain.on('convert:videos', (event, videos) => {

  videos.map(video => {

    const outputDirectory = video.path.split(video.name)[0];
    const outputFileName = video.name.split('.')[0];
    const outputPath = `${outputDirectory}${outputFileName}.${video.format}`;
    console.log(outputPath);
    ffmpeg(video.path)
      .output(outputPath)
      .on('progress', ({ timemark }) => 
        mainWindow.webContents.send('conversion:progress', { video, timemark })
      )
      .on('end', () => 
        mainWindow.webContents.send('conversion:end', { video, outputPath })
      )
      .run();
  })

});

ipcMain.on('open:folder', (event, outputPath) => {
  shell.showItemInFolder(outputPath);
});