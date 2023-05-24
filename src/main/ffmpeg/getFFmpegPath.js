const path = require('path');
const fs = require('fs');
const os = require('os');
const {app} = require('electron');
const log = require('@/main/log/index.js');

function getFFmpegPath() {
  let ffmpegPath;

  if (process.platform === 'win32') {
    // 获取用户的应用数据目录
    ffmpegPath = path.join(os.homedir(), '.togif', 'ffmpeg', 'win/bin/ffmpeg.exe');
  } else {
    ffmpegPath = path.join(os.homedir(), 'Application Support', app.getName(), 'ffmpeg', 'mac/ffmpeg');
  }

  log.info('ffmpegPath', ffmpegPath);

  return ffmpegPath;
}

function checkFileAccess(filePath, mode) {
  return new Promise((resolve, reject) => {
    fs.access(filePath, mode, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

// 使用封装的函数进行检查和处理
// checkFileAccess(ffmpegPath, fs.constants.F_OK)
//   .then(() => {
//     console.log('ffmpeg可执行文件存在。');
//   })
//   .catch((err) => {
//     console.error('ffmpeg可执行文件不存在！');
//   });

// checkFileAccess(ffmpegPath, fs.constants.X_OK)
//   .then(() => {
//     console.log('文件可执行', ffmpegPath);
//   })
//   .catch((err) => {
//     console.error('无权限执行该文件', ffmpegPath);
//   });
module.exports = getFFmpegPath;
