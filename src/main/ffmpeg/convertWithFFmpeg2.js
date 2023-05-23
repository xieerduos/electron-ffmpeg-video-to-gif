const {spawn} = require('child_process');
const getFFmpegPath = require('./getFFmpegPath.js');
const path = require('path');
const ffmpegPath = getFFmpegPath(); // 更新为你的ffmpeg路径

function convertWithFFmpeg(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    let totalDurationSeconds = null;
    const ffmpeg = spawn(ffmpegPath, ['-i', inputPath, outputPath]);

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
        console.log('Current progress:', progress + '%');
      }
    });

    ffmpeg.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`FFmpeg exited with code ${code}`));
      } else {
        console.log('Conversion completed successfully');
        resolve();
      }
    });

    ffmpeg.on('error', (err) => {
      console.error('Failed to start subprocess.', err);
      reject(err);
    });
  });
}

module.exports = convertWithFFmpeg;
// 使用示例
// convertWithFFmpeg('/path/to/input', '/path/to/output')
//   .then(() => console.log('Success!'))
//   .catch((err) => console.error('Conversion failed:', err));
