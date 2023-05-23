const path = require('path');
const fs = require('fs');
const os = require('os');
const {app} = require('electron');
const log = require('@/main/log/index.js');

function getFFmpegPath() {
  let ffmpegPath;

  if (process.env.NODE_ENV === 'development') {
    ffmpegPath = path.join(__static, 'ffmpeg', process.platform === 'darwin' ? 'mac/ffmpeg' : 'win/bin/ffmpeg.exe');
  } else {
    if (process.platform === 'darwin') {
      // 获取用户的应用数据目录
      const appDataPath = path.join(os.homedir(), 'Application Support', app.getName(), 'ffmpeg', 'mac/ffmpeg');

      // // 如果目录不存在，创建它
      // if (!fs.existsSync(path.join(appDataPath))) {
      //   fs.mkdirSync(path.join(appDataPath, '../'), {recursive: true});
      // }
      ffmpegPath = appDataPath;
    } else {
      ffmpegPath = path.join(process.resourcesPath, 'app.asar.unpacked', 'ffmpeg', 'win/bin/ffmpeg.exe');
    }
  }

  log.info('ffmpegPath', ffmpegPath);

  fs.access(ffmpegPath, fs.constants.F_OK, (err) => {
    if (err) {
      log.error('ffmpeg可执行文件不存在！');
    } else {
      log.log('ffmpeg可执行文件存在。');
    }
  });

  fs.access(ffmpegPath, fs.constants.X_OK, (err) => {
    if (err) {
      log.error('无权限执行该文件', ffmpegPath);
    } else {
      log.log('文件可执行', ffmpegPath);
    }
  });

  return ffmpegPath;
}
module.exports = getFFmpegPath;
