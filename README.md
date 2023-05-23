**[简体中文](README.md) | [English](README-en.md)**

# Electron FFmpeg Video to GIF

## 项目介绍

欢迎来到 Electron FFmpeg Video to GIF 项目！这个开源项目旨在提供一个简单，直接且免费的工具，将视频文件转换为 GIF 文件。利用 Electron 和 FFmpeg，我们成功实现了这个想法，并希望它能对您的需求有所帮助。这个项目也能帮助初学者了解如何使用前端技术开发 Electron 桌面端应用。请随时查看我们的代码，提出问题或建议，并分享您的使用体验。我们真诚欢迎所有的反馈，包括代码改进的建议，新特性的建议，或是任何其他形式的贡献。

## 项目效果

![Project Demo](./togif-demo.gif)

## 项目动机

当我想要把一个 video 转换成 gif 图片的时候，竟然找不到好用且免费的网站或者应用,故动手写一个免费开源的送给大家，同时，帮助想要入门 electron 的同学了解如何使用前端的技术开发 electron 桌面端应用。

## 技术实现

1. ffmpeg 下载可以执行安装包
2. 使用 node.js child_process 执行执行 ffmpeg 命令
3. 此时，传入文件路径，和输出目录 ffmpeg 把视频直接转换成 gif 图片
4. 使用 electron 打包可执行的安装包

## 技术栈

1. electron,ipc,tray
2. node.js,fs,path
3. html,css,javascript,vue3
4. vue-cli,vue-cli-plugin-electron-builder,electron-builder
5. electron-log
6. element-plus
7. ffmpeg
8. eslint,prettier,commitlint,.husky
9. sudo-prompt
10. 项目模版[electron-template](https://github.com/xieerduos/electron-template)

## 亮点难点

1. 如何把 ffmpeg 集成到 electron 应用中
2. 并发限制，使用队列控制并发任务
3. Mac 权限问题，如何提升权限
4. electron 进程之间的通信

## 遇到的问题

1. Mac Resources 目录执行权限不足问题
2. Mac 系统托盘图标失真问题
3. Mac 或者 Windows 不显示系统托盘图标问题（清除系统图标缓存-重启电脑）
4. Mac 开发环境不显示任务栏图标
5. ffmpeg 可执行文件-打包后变成文本文件 - 改成 zip 包
6. 如何解决 ffmpeg 集成到我们的应用中 asarUnpack
7. electron 版本问题，20 版本以上不支持直接在 preload.js 引入 node.js 相关模块

## Figma 设计稿

https://www.figma.com/file/K6Kx0px4lLFVp5qhPwxXyG/electron-ffmpeg-video-to-gif?type=design&node-id=6%3A13846&t=ipXiDwCpuFMm2WW9-1

## 快速开始

### 安装项目依赖

```
npm install
```

安装过程中遇到问题？

```
npm install --ignore-engines --legacy-peer-deps
```

### 启动项目

```
npm start
```

### 打包构建

```
npm run electron:build
```

### 代码检查和修复

```
npm run lint
```

## 自定义配置

Vue Cli https://cli.vuejs.org/config/

vue-cli-plugin-electron-builder https://github.com/nklayman/vue-cli-plugin-electron-builder

## 生成图标

https://www.npmjs.com/package/electron-icon-builder

把 public/logo.png 换成你自己的，运行下面命令

```bash
npm run logo
```

## License

Copyright (c) 李钟意.

Licensed under the [MIT](LICENSE.txt) license.

---

## **使用 FFmpeg 生成 GIF 文件**

这份指南将帮助你在 Mac 和 Windows 上安装 FFmpeg，并使用它将视频文件转换为 GIF 文件。

## 安装 FFmpeg

### 在 Mac 上安装

1. 访问 [FFmpeg 官网](https://ffmpeg.org/download.html)，下载适合你的 Mac 版本的 FFmpeg。

2. 解压下载的文件，并将解压后的文件夹放在一个你方便找到的位置，比如 `/project/ffmpeg/`。

3. 设置环境变量以让系统能找到 FFmpeg。在终端运行：

   ```bash
   vim ~/.zshrc
   ```

   在文件末尾添加一行：

   ```bash
   export PATH=$PATH:/project/ffmpeg/
   ```

   保存并关闭文件。然后，使更改生效：

   ```bash
   source ~/.zshrc
   ```

   这个操作将把你的 FFmpeg 文件夹路径添加到 PATH 环境变量中。

### 在 Windows 上安装

1. 访问 [FFmpeg 官网](https://ffmpeg.org/download.html)，下载适合你的 Windows 版本的 FFmpeg。

2. 下载 ZIP 文件并解压到你想要放置的位置，比如 `C:\` 目录。

3. 在 "系统属性" -> "高级" -> "环境变量" 中添加 FFmpeg 到系统环境变量。在系统变量中找到 "Path"，点击 "编辑"，然后 "新建"，把 FFmpeg 的 bin 目录路径添加进去，例如 `C:\ffmpeg\bin`。

4. 点击确认，关闭所有窗口。

5. 打开一个新的命令行窗口，输入 `ffmpeg -version`。如果能看到 FFmpeg 的版本信息，说明安装成功。

## 使用 FFmpeg

以下命令都是在命令行终端中执行的，无论是 Mac 的终端还是 Windows 的命令提示符。

你可以通过运行 `ffmpeg -version` 来测试 FFmpeg 是否正确安装。如果看到关于 FFmpeg 版本的信息，那么表示 FFmpeg 已经正确安装。

## 将视频文件转换为 GIF

你可以使用以下命令将视频文件（例如 MP4 文件）转换为 GIF：

1. 使用 FFmpeg 直接将视频文件转换为 GIF。以下命令将把名为 `video.mp4` 的视频转换为名为 `video.gif` 的 GIF 文件：

```bash
# ffmpeg -i video.mp4 video.gif
ffmpeg -i 520.mp4 520.gif
```

2. 如果你想生成高质量的 GIF 文件，你可以先生成一个调色板。这是因为 GIF 格式只支持最多 256 种颜色，而生成一个调色板可以帮助 FFmpeg 选择最合适的颜色集来最大化 GIF 的质量。

```bash
# ffmpeg -i video.mp4 -vf "fps=10,scale=-1:-1:flags=lanczos,palettegen" palette.png
ffmpeg -i 520.mp4 -vf "fps=10,scale=-1:-1:flags=lanczos,palettegen" palette.png
```

3. 然后，你可以使用以下命令与调色板一起生成 GIF：

```bash
# ffmpeg -i video.mp4 -i palette.png -filter_complex "fps=10,scale=-1:-1:flags=lanczos[x];[x][1:v]paletteuse" high_quality.gif
ffmpeg -i 520.mp4 -i palette.png -filter_complex "fps=10,scale=-1:-1:flags=lanczos[x];[x][1:v]paletteuse" high_quality.gif
```

在这些命令中，`fps=10` 是 GIF 的帧率，`scale=-1:-1` 使 GIF 的大小和输入视频的大小相同。你可以根据需求调整这些参数。

这些命令可能会生成大文件，但是如果你不关心文件大小，那么这应该能够提供很高的质量。你也可以调整 `fps` 参数来改变 GIF 的帧率，以达到你的期望效果。

## 赞赏

非常感谢您对我的开源项目的关注和使用！如果您觉得这个项目对您有所帮助，并且想要支持它的发展，您可以考虑赞赏一下。您的赞赏将鼓励我不断改进项目并提供更多的功能。赞赏是完全自愿的，无论您是否赞赏，我都会继续致力于提供优质的开源项目。

![](./wechat.jpg)

请注意，赞赏是作为对我工作的认可和鼓励。我将继续努力提供高质量的开源项目，感谢您对我的支持和理解！
