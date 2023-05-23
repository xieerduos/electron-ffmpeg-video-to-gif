const path = require('path');
const os = require('os');
const convertWithFFmpeg = require('./convertWithFFmpeg.js');
const {ipcMain, shell, app} = require('electron');
const log = require('@/main/log/index.js');
const fs = require('fs');

const mapTask = new Map();

exports.initialize = async function (mainWindow) {
  try {
    ipcMain.handle('toMain', (event, message = {}) => {
      log.info('message', message);
      if (typeof message === 'object' && message && message.type === 'showItemInFolder') {
        if (!message.fullPath) {
          return Promise.reject(new Error('fullPath 参数错误'));
        }

        // 如果目录不存在，提示不存在
        if (!fs.existsSync(path.join(message.fullPath))) {
          return Promise.reject(new Error('fullPath 参数错误'));
        }
        return shell.showItemInFolder(message.fullPath);
      }
      if (typeof message === 'object' && message && message.type === 'getResultPath') {
        if (!message.filePath) {
          return Promise.reject(new Error('filePath 参数错误'));
        }
        return getResultPath(message.filePath);
      }
      if (typeof message === 'object' && message && message.type === 'video-stop-to-gif') {
        return convertAbortVideoToGif(message);
      }
      if (typeof message === 'object' && message && message.type === 'video-to-gif') {
        return convertVideoToGif(mainWindow, message);
      }
    });
  } catch (error) {
    log.error('error', error);
  }
};

function getResultPath(filePath) {
  const fileName = path.basename(filePath, path.extname(filePath));
  const appDataPath = path.join(os.homedir(), 'Documents', app.getName());
  if (!fs.existsSync(appDataPath)) {
    fs.mkdirSync(appDataPath, {recursive: true});
  }

  return path.join(appDataPath, fileName + '.gif');
}

function convertAbortVideoToGif(message) {
  if (message.taskId !== 0 && !message.taskId) {
    return Promise.reject(new Error({message: '参数错误', data: message}));
  }

  const current = mapTask.get(message.taskId);

  if (current) {
    current.abort();
    return Promise.resolve('停止成功');
  }
  return Promise.reject(new Error({message: '停止失败 未找到任务:', taskId: message.taskId, current}));
}

function convertVideoToGif(mainWindow, message) {
  const input = message.input;
  const frameRate = message.frameRate || 10;
  const taskId = message.taskId;

  if ([input, taskId].filter((item) => !item).length > 0) {
    return Promise.reject(new Error({message: '参数错误', data: message}));
  }

  // const output = path.join(os.homedir(), 'Downloads', fileName + '.gif');
  const output = getResultPath(input);

  const task = convertWithFFmpeg(input, output, frameRate, (progress) => {
    log.log('progress', taskId, progress);
    mainWindow.webContents.send('fromMain', {type: 'video-to-gif', taskId, name: 'progress', value: progress});
  });
  mapTask.set(taskId, task);
  return task
    .start()
    .then(() => log.log('Success!', taskId))
    .catch((err) => {
      log.error('Conversion failed:', taskId, err);
      throw err;
    })
    .finally(() => {
      mapTask.delete(taskId);
    });
}
