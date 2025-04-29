# 口袋48工具

![GitHub Release](https://img.shields.io/github/v/release/duan602728596/48tools)
   ![GitHub License](https://img.shields.io/github/license/duan602728596/48tools)   ![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/duan602728596/48tools/.github%2Fworkflows%2Fbuild.yml?style=flat&label=Build%20apps%20CI%20(Intel))   ![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/duan602728596/48tools/.github%2Fworkflows%2Fbuild-xlarge.yml?style=flat&label=Build%20apps%20CI%20in%20xlarge%20runner%20(ARM))   
![Static Badge](https://img.shields.io/badge/Win10-fa541c?style=for-the-badge)   ![Static Badge](https://img.shields.io/badge/Win11-fa8c16?style=for-the-badge)   ![Static Badge](https://img.shields.io/badge/Linux-722ed1?style=for-the-badge)   ![Static Badge](https://img.shields.io/badge/MacOS-eb2f96?style=for-the-badge)   

> 根据[Electron的支持政策](https://www.electronjs.org/docs/latest/tutorial/electron-timelines)，软件将会在下一个版本升级Electron的版本。Electron版本大于v22，软件将不支持win8及以下版本。

## 使用文档

文档地址：[https://yzb1g5r02h.feishu.cn/docx/MxfydWlNaovZ5sxsbJ5crnAlnVb](https://yzb1g5r02h.feishu.cn/docx/MxfydWlNaovZ5sxsbJ5crnAlnVb) 。

## 软件下载链接

* Github：https://github.com/duan602728596/48tools/releases
* 百度网盘：https://github.com/duan602728596/document/blob/master/48/README.md

## 软件功能

> 1. 使用前，需要先下载FFmpeg，并配置FFmpeg的软件位置。播放视频功能需要配置后重新启动软件。   
> 2. 使用48相关的功能，需要配置App Data目录来保存网易云信的SDK生成的数据。   
> 3. 微博超话签到，需要配置无头浏览器的地址。

* SNH48
  * 口袋48直播录源
  * 口袋48录播下载
  * PC端观看口袋48直播（有弹幕）
  * PC端观看口袋48录播（有弹幕）
  * SNH48官方公演直播录制
  * SNH48官方公演录播下载
* B站 
  * 直播录源
  * 视频下载
* A站
  * 直播录源
  * 视频下载
* 抖音
  * 直播录源
  * 视频下载（支持视频ID、账户ID、视频地址、账户主页、分享地址，支持一键下载） 
* 快手
  * 直播录源
  * 视频下载
* 小红书直播录源
* SHOWROOM直播录源
* 微博
  * 超级话题签到
  * 直播录制
  * 微博图片下载
* 视频处理
  * 视频剪切
  * 视频合并
  * 直接执行FFmpeg命令（支持命令的本地保存）

### MacOS的ARM版本运行时会提示软件已损坏，无法打开

在软件目录打开终端，运行`sudo xattr -rd com.apple.quarantine 48tools.app`或`sudo xattr -cr 48tools.app`。然后尝试重新运行。

<img src="statics/macos-arm-run-app.png" width="580">

## 许可证

本软件以及所有源代码受**GNU General Public License v3.0**许可证的约束。

## 软件开发

### 技术栈

Pug + Sass + TypeScript + React + antd + Webpack + TailwindCSS + Electron。包管理工具使用corepack。   
使用jest + ts-jest进行单元测试，使用playwright + @playwright/test进行E2E测试。   

### 模块

* 48tools: 软件源代码。
* main：Electron主程序运行源代码。
* help：软件本地帮助文件源代码。
* test：E2E测试代码。
* babel-plugin-delay-require：Babel插件，支持Node模块的按需加载。
* postcss-plugin-remove-classnames：postcss插件，删除TailwindCSS生成的无用的class。

### 开发过程

> 在使用WebStorm开发时，如果出现提示eslint检测超时的错误，需要按照[**这个步骤**](https://youtrack.jetbrains.com/issue/WEB-63073/ESLint-creates-a-lot-of-node-processes#focus=Comments-27-8111996.0-0)来配置。

1. main模块：进入`packages/main`，运行`node --run start`，开发主程序源代码；或运行`npm run dev`，编译开发环境的主程序源代码。
2. 48tools模块：进入`packages/48tools`，运行`node --run dll`。
3. 48tools模块：该模块有两种开发方式可选择。进入`packages/48tools`，
   1. 启动开发服务器：
      1. 运行`node --run start:serve`，启动开发服务器。
      2. 运行`node --run runel:serve`，启动软件。
   2. 编译文件到本地硬盘：
      1. 运行`node --run start`，开始开发。
      2. 运行`node --run runel`，启动软件。
4. help模块：进入`packages/help`，运行`node --run start`，开发帮助文件源代码。

### 编译

> 运行`node scripts/delivery.mjs`，完成整个编译过程。

1. main模块：进入`packages/main`，运行`node --run build`，编译主程序源代码。
2. 48tools模块：进入`packages/48tools`，运行`node --run build`，编译软件源代码。
3. help模块：进入`packages/help`，运行`node --run build`，编译帮助文件源代码。
4. 运行`node scripts/unpack.mjs`，打包软件。
5. 运行`node scripts/clean.mjs`，删除软件中的无用的文件。

### 测试

1. 完成开发的所有编译过程。
2. 进入`packages/48tools`，运行`node --run test`，运行单元测试。
3. 进入`packages/test`，运行`node --run test`，运行E2E测试。

### 源代码托管地址

github：[https://github.com/duan602728596/48tools](https://github.com/duan602728596/48tools)。
