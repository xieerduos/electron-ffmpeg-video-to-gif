const fs = require('fs');

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
// const getFFmpegPath = require('@/main/ffmpeg/getFFmpegPath.js');

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
module.exports = checkFileAccess;
