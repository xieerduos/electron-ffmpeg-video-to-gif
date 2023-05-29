const {ipcMain, BrowserWindow} = require('electron');

module.exports = function useTitlebar(currentWindow) {
  const webContents = currentWindow.webContents;

  currentWindow.on('maximize', () => {
    webContents.send('titlebar', {type: 'maximize', isMaximized: true});
  });
  currentWindow.on('unmaximize', () => {
    webContents.send('titlebar', {type: 'maximize', isMaximized: false});
  });

  currentWindow.on('enter-full-screen', () => {
    webContents.send('titlebar', {type: 'fullscreen', isFullScreen: true});
  });
  currentWindow.on('leave-full-screen', () => {
    webContents.send('titlebar', {type: 'fullscreen', isFullScreen: false});
  });

  ipcMain.handle('titlebar', (event, data = {}) => {
    switch (data.type) {
      case 'isMaximized': {
        const window = BrowserWindow.fromWebContents(webContents);
        return window.isMaximized();
      }
      case 'getIsWindwos': {
        return process.platform === 'win32';
      }
      case 'getFullScreen': {
        const window = BrowserWindow.fromWebContents(webContents);
        return window.isFullScreen();
      }
      case 'minimizeWindow': {
        const window = BrowserWindow.fromWebContents(webContents);
        window.minimize();
        break;
      }
      case 'setFullScreen': {
        const window = BrowserWindow.fromWebContents(webContents);
        window.setFullScreen(data.isFullScreen);
        break;
      }
      case 'toggleMaximize': {
        const window = BrowserWindow.fromWebContents(webContents);
        if (window.isMaximized()) {
          window.unmaximize();
        } else {
          window.maximize();
        }
        break;
      }
      case 'closeWindow': {
        const window = BrowserWindow.fromWebContents(webContents);
        window.close();
        break;
      }

      default:
        break;
    }
  });
};
