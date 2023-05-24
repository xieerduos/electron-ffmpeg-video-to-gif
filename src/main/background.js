'use strict';

import {app, protocol, BrowserWindow} from 'electron';
import {createProtocol} from 'vue-cli-plugin-electron-builder/lib';
import installExtension, {VUEJS3_DEVTOOLS} from 'electron-devtools-installer';
import path from 'path';
import fs from 'fs';
const log = require('@/main/log/index.js');
log.info(`Node.js 版本: ${process.versions.node}`);
log.info('process.cwd()', process.cwd());

const isDevelopment = process.env.NODE_ENV !== 'production';

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([{scheme: 'app', privileges: {secure: true, standard: true}}]);

const windowManager = {
  mainWindow: null
};

let isQuitting = false;

// let mainWindow;
async function createWindow() {
  // Create the browser window.
  windowManager.mainWindow = new BrowserWindow({
    width: 950,
    height: 620,
    minWidth: 900,
    minHeight: 600,
    autoHideMenuBar: true, // 自动隐藏菜单
    title: ' ', // 标题
    // eslint-disable-next-line no-undef
    icon: path.join(__static, `icons/${process.platform === 'win32' ? 'win/icon.ico' : 'png/icon.png'}`),
    webPreferences: {
      // eslint-disable-next-line no-undef
      preload: path.join(__dirname, 'mainWindow.js'),
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION
    }
  });

  windowManager.mainWindow.on('show', () => {
    // windowManager.mainWindow.setSkipTaskbar(false);
  });

  windowManager.mainWindow.on('close', (event) => {
    if (!isQuitting) {
      // 关闭窗口 不退出应用
      event.preventDefault();
      windowManager.mainWindow.hide();
      // mainWindow.setSkipTaskbar(true);
    }
    // 如果 isQuitting 为 true，则允许窗口关闭，从而使应用退出
  });

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await windowManager.mainWindow.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
    // if (!process.env.IS_TEST) windowManager.mainWindow.webContents.openDevTools();
  } else {
    createProtocol('app');
    // Load the index.html when not in development
    windowManager.mainWindow.loadURL('app://./index.html');
  }
}

app.on('before-quit', () => {
  isQuitting = true;
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  } else {
    if (windowManager.mainWindow && !windowManager.mainWindow.isDestroyed()) {
      windowManager.mainWindow.show();
    }
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  const copyResourceToAppData = require('@/main/ffmpeg/copyResourceToAppData.js');
  const filePath = process.platform === 'win32' ? 'ffmpeg/win/win.zip' : 'ffmpeg/mac/ffmpeg.zip';

  const getFFmpegPath = require('@/main/ffmpeg/getFFmpegPath.js');
  const checkFileAccess = require('@/main/ffmpeg/checkFileAccess.js');
  const ffmpegPath = getFFmpegPath();
  checkFileAccess(ffmpegPath, fs.constants.F_OK)
    .then(() => {
      log.info('ffmpeg可执行文件存在。');
    })
    .catch((err) => {
      log.error('ffmpeg可执行文件不存在！', err);
      copyResourceToAppData(filePath)
        .then(() => {
          log.info('Resource copied successfully', filePath);
        })
        .catch((error) => {
          log.error('error', error);
        });
    });

  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      // await installExtension(VUEJS3_DEVTOOLS);
      await installExtension({
        id: 'ljjemllljcmogpfapbkkighbhhppjdbg', // Vue Devtools beta
        electron: '>=1.2.1'
      });
    } catch (e) {
      log.error('Vue Devtools failed to install:', e.toString());
    }
  }
  createWindow();
  const tray = require('@/main/tray/index.js');

  const ffmpeg = require('@/main/ffmpeg/index.js');

  ffmpeg.initialize(windowManager.mainWindow);

  tray.initialize(windowManager);

  if (process.platform === 'darwin') {
    // 仅在 macOS 上设置 Dock 图标
    const iconPath = path.join(__static, 'icons/png/512x512.png');
    app.dock.setIcon(iconPath);
  }
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit();
      }
    });
  } else {
    process.on('SIGTERM', () => {
      app.quit();
    });
  }
}
