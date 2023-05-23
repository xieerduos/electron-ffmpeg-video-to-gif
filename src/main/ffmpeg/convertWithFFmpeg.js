// const sudo = require('sudo-prompt');
// const options = {
//   name: 'Electron',
//   icns: '/Users/shaohai.li/project/electron-ffmpeg/public/icons/mac/icon.icns' // (optional)
// };
// sudo.exec('echo hello', options, function (error, stdout, stderr) {
//   if (error) throw error;
//   console.log('stdout: ' + stdout);
// });

const {spawn} = require('child_process');
const getFFmpegPath = require('./getFFmpegPath.js');

const log = require('@/main/log/index.js');
function convertWithFFmpeg(inputPath, outputPath, frameRate = 30, onCurrentProgress) {
  const ffmpegPath = getFFmpegPath(); // 更新为你的ffmpeg路径

  log.info('[convertWithFFmpeg ffmpegPath]', ffmpegPath);

  const controller = new AbortController();
  const {signal} = controller;

  return {
    start: () =>
      new Promise((resolve, reject) => {
        let totalDurationSeconds = null;
        let paletteProgress = 0;
        let convertProgress = 0;

        const ffmpeg = spawn(
          ffmpegPath,
          [
            '-i',
            inputPath,
            '-r',
            frameRate.toString(),
            '-filter_complex',
            'scale=iw:-1:flags=lanczos,fps=30,palettegen=stats_mode=diff',
            '-y',
            '/tmp/palette.png'
          ],
          {signal}
        );

        const onProgress = (progress, isPalette) => {
          if (isPalette) {
            paletteProgress = progress;
          } else {
            convertProgress = progress;
          }
          const totalProgress = paletteProgress * 0.15 + convertProgress * 0.85;
          onCurrentProgress(totalProgress);
        };

        ffmpeg.stderr.on('data', (data) => {
          const string = new TextDecoder().decode(data);
          const durationRegex = /Duration: (\d+:\d+:\d+\.\d+)/;
          const durationMatch = string.match(durationRegex);
          const timeRegex = /time=(\d+:\d+:\d+\.\d+)/;
          const timeMatch = string.match(timeRegex);

          if (durationMatch) {
            const duration = durationMatch[1];
            const [hours, minutes, seconds] = duration.split(':').map(parseFloat);
            totalDurationSeconds = hours * 3600 + minutes * 60 + seconds;
          }

          if (timeMatch && totalDurationSeconds) {
            const time = timeMatch[1];
            const [hours, minutes, seconds] = time.split(':').map(parseFloat);
            const timeSeconds = hours * 3600 + minutes * 60 + seconds;
            const progress = (timeSeconds / totalDurationSeconds) * 100;
            onProgress(progress, true);
          }
        });

        ffmpeg.on('close', (code) => {
          if (code !== 0) {
            reject(new Error(`FFmpeg exited with code ${code}`));
          } else {
            const ffmpeg2 = spawn(
              ffmpegPath,
              [
                '-i',
                inputPath,
                '-i',
                '/tmp/palette.png',
                '-r',
                frameRate.toString(),
                '-filter_complex',
                'scale=iw:-1:flags=lanczos,fps=30,paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle',
                '-y',
                outputPath
              ],
              {signal}
            );

            ffmpeg2.stderr.on('data', (data) => {
              const string = new TextDecoder().decode(data);
              const durationRegex = /Duration: (\d+:\d+:\d+\.\d+)/;
              const durationMatch = string.match(durationRegex);
              const timeRegex = /time=(\d+:\d+:\d+\.\d+)/;
              const timeMatch = string.match(timeRegex);

              if (durationMatch) {
                const duration = durationMatch[1];
                const [hours, minutes, seconds] = duration.split(':').map(parseFloat);
                totalDurationSeconds = hours * 3600 + minutes * 60 + seconds;
              }

              if (timeMatch && totalDurationSeconds) {
                const time = timeMatch[1];
                const [hours, minutes, seconds] = time.split(':').map(parseFloat);
                const timeSeconds = hours * 3600 + minutes * 60 + seconds;
                const progress = (timeSeconds / totalDurationSeconds) * 100;
                onProgress(progress, false);
              }
            });

            ffmpeg2.on('close', (code) => {
              if (code !== 0) {
                reject(new Error(`FFmpeg exited with code ${code}`));
              } else {
                console.log('Conversion completed successfully');
                resolve();
              }
            });

            ffmpeg2.on('error', (err) => {
              console.error('Failed to start subprocess.', err);
              reject(err);
            });
          }
        });

        ffmpeg.on('error', (err) => {
          console.error('Failed to start subprocess.', err);
          reject(err);
        });
      }),
    abort: () => controller.abort()
  };
}

module.exports = convertWithFFmpeg;

// 使用示例
/*
const task = convertWithFFmpeg('/path/to/input', '/path/to/output');

task.start()
  .then(() => console.log('Success!'))
  .catch((err) => console.error('Conversion failed:', err));

// 稍后，当你想要停止转换的时候...
task.abort();
*/
