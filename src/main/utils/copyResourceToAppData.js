const fs = require('fs');
const path = require('path');
const os = require('os');
const {app} = require('electron');
const log = require('@/main/log/index.js');
const sudoPrompt = require('sudo-prompt');
const {exec} = require('child_process');

function copyResourceToAppData(resourceName) {
  return new Promise((resolve, reject) => {
    // 获取应用的资源目录
    const resourcesPath
      = process.env.NODE_ENV === 'production' ? path.join(process.resourcesPath, 'app.asar.unpacked') : __static;

    // 获取用户的应用数据目录
    const appDataPath = path.join(os.homedir(), 'Application Support', app.getName());

    // 如果目录不存在，创建它
    if (!fs.existsSync(path.join(appDataPath, resourceName, '../'))) {
      fs.mkdirSync(path.join(appDataPath, resourceName, '../'), {recursive: true});
    }

    // 检查是否有写入权限
    fs.access(appDataPath, fs.constants.W_OK, (err) => {
      if (err) {
        const command = `cp -R "${path.join(resourcesPath, resourceName)}" "${path.join(appDataPath, resourceName)}"`;
        sudoPrompt.exec(command, {name: app.getName()}, (error) => {
          if (error) {
            reject(new Error(`Failed to copy resource with sudo: ${error.message}`));
          } else {
            resolve();
          }
        });
      } else {
        // 设置源文件路径
        const source = path.join(resourcesPath, resourceName);
        log.info('source', source);
        // 检查是否有读取权限
        fs.access(source, fs.constants.R_OK, (err) => {
          if (err) {
            reject(new Error(`No read permission on ${source}`));
          } else {
            // 设置目标文件路径
            const destination = path.join(appDataPath, resourceName);

            // 检查目标文件是否已经存在，如果不存在，复制文件
            if (!fs.existsSync(destination)) {
              fs.copyFileSync(source, destination);
            }
            // resolve();
            // 如果是 ZIP 文件，解压缩
            if (path.extname(destination).toLowerCase() === '.zip') {
              const unzipCommand = `unzip "${destination}" -d "${path.join(destination, '../')}"`;
              exec(unzipCommand, (unzipError, stdout, stderr) => {
                if (unzipError) {
                  reject(new Error(`Failed to unzip file: ${stderr}`));
                } else {
                  resolve();
                }
              });
            } else {
              resolve();
            }
          }
        });
      }
    });
  });
}

module.exports = copyResourceToAppData;

// 在应用启动时调用这个函数
// copyResourceToAppData('app.asar.unpacked/ffmpeg/mac/ffmpeg')
//   .then(() => log.info('Resource copied successfully'))
//   .catch((err) => console.error(err));
