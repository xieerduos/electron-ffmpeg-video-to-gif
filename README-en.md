# Electron FFmpeg Video to GIF

## Introduction

Welcome to the Electron FFmpeg Video to GIF project! This open-source project aims to provide a simple, straightforward, and free tool for converting video files into GIFs. With Electron and FFmpeg, we've managed to bring this idea to life and we hope it serves your needs well. This project also offers insights into how front-end technologies can be used to develop desktop applications with Electron for beginners. Feel free to explore our code, ask questions or make suggestions, and share your user experiences. We sincerely welcome all feedback, including suggestions for code improvements, new features, or any other forms of contribution.

## Overview

![Project Demo](./togif-demo.gif)

## Project Motivation

While working on an open-source project on GitHub, I wanted to incorporate GIFs into my work. It was surprising to discover that there were hardly any reliable and free websites or applications available to convert videos into GIFs. This sparked the idea to create an open-source tool to address this need, and in the process, provide an insight into how front-end technologies can be utilized to develop desktop applications with Electron for beginners in this domain.

## Technical Implementation

1. Downloading the executable FFmpeg package.
2. Using Node.js's child_process to run FFmpeg commands.
3. Passing the file path and output directory to FFmpeg, which converts the video directly into a GIF.
4. Packaging the Electron application into an executable installation package.

## Technology Stack

1. Electron, ipc, tray
2. Node.js, fs, path
3. HTML, CSS, JavaScript, Vue3
4. Vue-cli, vue-cli-plugin-electron-builder, electron-builder
5. Electron-log
6. Element-plus
7. FFmpeg
8. ESLint, Prettier, Commitlint, Husky
9. Sudo-prompt
10. Project Template: [Electron-template](https://github.com/xieerduos/electron-template)

## Highlights & Challenges

1. Integrating FFmpeg into an Electron application.
2. Managing concurrent tasks using a queue system.
3. Dealing with Mac permission issues and privilege escalation.
4. Inter-process communication in Electron.

## Issues Encountered

1. Insufficient permission issue for Mac's Resources directory.
2. Distorted system tray icon on Mac.
3. Absence of system tray icon on Mac or Windows (Clear system icon cache - Restart computer).
4. Absence of taskbar icon in Mac development environment.
5. FFmpeg executable file turned into a text file after packaging - switched to zip package.
6. Integrating FFmpeg into our application using asarUnpack.
7. Electron version issue - versions above 20 do not support direct importing of Node.js modules in preload.js.
8. When the data reaches 500 records, issues such as lag, delays, and failed state updates occur.

## Figma Design

[https://www.figma.com/file/K6Kx0px4lLFVp5qhPwxXyG/electron-ffmpeg-video-to-gif?type=design&node-id=6%3A13846&t=ipXiDwCpuFMm2WW9-1](https://www.figma.com/file/K6Kx0px4lLFVp5qhPwxXyG/electron-ffmpeg-video-to-gif?type=design&node-id=6%3A13846&t=ipXiDwCpuFMm2WW9-1)

## Quick Start

### Install Project Dependencies

```bash
npm install --force
```

### Issues during installation?

```
npm install --ignore-engines --legacy-peer-deps
```

Still having issues? Check Frequently Asked Questions

### Start the Project

```
npm start
```

### Build the Package

```bash
npm run electron:build
```

### Code Inspection and Fixes

```bash
npm run lint
```

## Custom Configuration

Vue Cli https://cli.vuejs.org/config/

vue-cli-plugin-electron-builder https://github.com/nklayman/vue-cli-plugin-electron-builder

## Icon Generation

Visit electron-icon-builder. Replace public/logo.png with your own, then run the command:

```bash
npm run logo
```

## License

Copyright (c) Li Zhongyi.

Licensed under the [MIT](LICENSE.txt) license.

---

## **Generating GIF files using FFmpeg**

This guide will help you install FFmpeg on Mac and Windows and use it to convert video files to GIF files.

## Installing FFmpeg

### Installation on Mac

1. Visit the [FFmpeg official website](https://ffmpeg.org/download.html) and download the version of FFmpeg that suits your Mac.

2. Unzip the downloaded file and place the unzipped folder in a location that you can easily find, such as `/project/ffmpeg/`.

3. Set environment variables so that the system can find FFmpeg. Run in the terminal:

   ```bash
   vim ~/.zshrc
   ```

   Add a line at the end of the file:

   ```bash
   export PATH=$PATH:/project/ffmpeg/
   ```

   Save and close the file. Then, make the changes effective:

   ```bash
   source ~/.zshrc
   ```

   This operation will add your FFmpeg folder path to the PATH environment variable.

### Installation on Windows

1. Visit the [FFmpeg official website](https://ffmpeg.org/download.html) and download the version of FFmpeg suitable for your Windows.

2. Download the ZIP file and unzip it to the location you want to place it, such as the `C:\` directory.

3. Add FFmpeg to the system environment variables in "System Properties" -> "Advanced" -> "Environment Variables". Find "Path" in system variables, click "Edit", then "New", and add the bin directory path of FFmpeg, such as `C:\ffmpeg\bin`.

4. Click OK, close all windows.

5. Open a new command line window and enter `ffmpeg -version`. If you can see the version information of FFmpeg, it means that the installation was successful.

## Using FFmpeg

The following commands are executed in the command line terminal, whether it is the terminal of Mac or the command prompt of Windows.

You can test whether FFmpeg is installed correctly by running `ffmpeg -version`. If you see information about the FFmpeg version, it means that FFmpeg has been installed correctly.

## Convert Video Files to GIF

You can use the following command to convert video files (such as MP4 files) to GIF:

1. Use FFmpeg to directly convert video files to GIF. The following command will convert a video named `video.mp4` to a GIF file named `video.gif`:

```bash

# ffmpeg -i video.mp4 video.gif

ffmpeg -i 520.mp4 520.gif
```

2. If you want to generate a high-quality GIF file, you can first generate a palette. This is because the GIF format only supports up to 256 colors, and generating a palette can help FFmpeg choose the most suitable color set to maximize the quality of the GIF.

```bash

# ffmpeg -i video.mp4 -vf "fps=10,scale=-1:-1:flags=lanczos,palettegen" palette.png

ffmpeg -i 520.mp4 -vf "fps=10,scale=-1:-1:flags=lanczos,palettegen" palette.png
```

3. Then, you can use the following command to generate a GIF with the palette:

```bash

# ffmpeg -i video.mp4 -i palette.png -filter_complex "fps=10,scale=-1:-1:flags=lanczos[x];[x][1:v]paletteuse" high_quality.gif

ffmpeg -i 520.mp4 -i palette.png -filter_complex "fps=10,scale=-1:-1:flags=lanczos[x];[x][1:v]paletteuse" high_quality.gif
```

In these commands, `fps=10` is the frame rate of the GIF, and `scale=-1:-1` makes the size of the GIF the same as the input video. You can adjust these parameters as needed.

These commands may generate large files, but if you don't care about file size, this should provide high quality. You can also adjust the `fps` parameter to change the frame rate of the GIF to achieve your desired effect.

## Support Me

I appreciate your interest and use of my open-source project! If you find this project helpful and would like to support its development, please consider offering your support. Your contributions would encourage me to continue improving the project and delivering more features. Supporting the project is entirely voluntary, and regardless of your decision, I remain committed to providing high-quality open-source projects.

[Wechat QR](./wechat.jpg)

Please note, your contributions are a form of acknowledgement and encouragement for my work. I will continue to strive to provide high-quality open-source projects, and I appreciate your understanding and support!
