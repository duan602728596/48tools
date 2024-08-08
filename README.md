# 口袋48工具

> 根据[Electron的支持政策](https://www.electronjs.org/docs/latest/tutorial/electron-timelines)，软件将会在下一个版本升级Electron的版本。Electron版本大于v22，软件将不支持win8及以下版本。

## 文档

文档地址：[https://yzb1g5r02h.feishu.cn/docx/MxfydWlNaovZ5sxsbJ5crnAlnVb](https://yzb1g5r02h.feishu.cn/docx/MxfydWlNaovZ5sxsbJ5crnAlnVb) 。

## 软件下载链接

* Github：https://github.com/duan602728596/48tools/releases
* 百度网盘：https://github.com/duan602728596/document/blob/master/48/README.md

## 软件功能

> 使用前，需要先下载FFmpeg，并配置FFmpeg的软件位置。播放视频功能需要配置后重新启动软件。   
> 使用48相关的功能，需要配置App Data目录来保存网易云信的SDK生成的数据。   
> 微博超话签到，需要配置无头浏览器的地址。

* 口袋48直播录源
* 口袋48录播下载
* PC端观看口袋48直播（有弹幕）
* PC端观看口袋48录播（有弹幕）
* snh48官方公演直播录制
* snh48官方公演录播下载
* B站直播录源
* B站视频下载
* A站直播录源
* A站视频下载
* 抖音视频下载（支持视频ID、账户ID、视频地址、账户主页、分享地址，支持一键下载）
* 抖音直播录源
* 快手视频下载
* 快手直播录源
* 视频剪切
* 视频合并
* 直接执行FFmpeg命令（支持命令的本地保存）
* 微博超级话题签到

## MacOS的ARM版本运行时会提示软件已损坏，无法打开

在软件目录打开终端，运行`sudo xattr -rd com.apple.quarantine 48tools.app`或`sudo xattr -cr 48tools.app`。然后尝试重新运行。

## 许可证

本软件以及所有源代码受**GNU General Public License v3.0**许可证的约束。

## 技术栈

Pug + Sass + TypeScript + React + antd + Webpack + Electron。包管理工具使用corepack。   
使用playwright + @playwright/test进行E2E测试。

## 模块

* 48tools: 软件源代码。
* main：Electron主程序运行源代码。
* help：软件本地帮助文件源代码。
* test：E2E测试代码。
* babel-plugin-delay-require：Babel插件，支持Node模块的按需加载。

## 开发

1. main模块：进入`packages/main`，运行`npm run start`，开发主程序源代码；或运行`npm run dev`，编译开发环境的主程序源代码。
2. 48tools模块：进入`packages/48tools`，运行`npm run dll`，然后运行`npm run start`。
3. 48tools模块：进入`packages/48tools`，运行`npm run runel`，启动软件。
4. help模块：进入`packages/help`，运行`npm run start`，开发帮助文件源代码。

## 编译

> 运行`node scripts/delivery.mjs`，完成整个编译过程。

1. main模块：进入`packages/main`，运行`npm run build`，编译主程序源代码。
2. 48tools模块：进入`packages/48tools`，运行`npm run build`，编译软件源代码。
3. help模块：进入`packages/help`，运行`npm run build`，编译帮助文件源代码。
4. 运行`node scripts/unpack.mjs`，打包软件。
5. 运行`node scripts/clean.mjs`，删除软件中的无用的文件。

## 测试

1. 完成开发的所有编译过程。
2. 进入`packages/test`，运行`npm run test`，运行E2E测试。

## 源代码托管地址

github：[https://github.com/duan602728596/48tools](https://github.com/duan602728596/48tools)。