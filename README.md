# 口袋48工具

## 文档

文档地址：[https://yzb1g5r02h.feishu.cn/docx/MxfydWlNaovZ5sxsbJ5crnAlnVb](https://yzb1g5r02h.feishu.cn/docx/MxfydWlNaovZ5sxsbJ5crnAlnVb) 。

## 软件下载链接

进入到 https://github.com/duan602728596/48tools/releases 、 https://gitee.com/duanhaochen/a48tools/releases      
或 https://github.com/duan602728596/document/blob/master/48/README.md 下载。

## 软件功能

> 使用前，需要先下载FFmpeg，并配置FFmpeg的软件位置。播放视频功能需要配置后重新启动软件。   
> 微博超话签到，需要配置无头浏览器的地址。

* 口袋48直播录源
* 口袋48录播下载
* PC端观看口袋48直播（有弹幕）
* PC端观看口袋48录播
* snh48官方公演直播录制
* snh48官方公演录播下载
* B站直播录源
* B站视频下载
* A站直播录源
* A站视频下载
* 抖音视频下载（支持视频ID、账户ID、视频地址、账户主页、分享地址）
* 视频剪切
* 视频合并
* 直接执行FFmpeg命令（支持命令的本地保存）
* 微博超级话题签到

## 许可证

本软件以及所有源代码受**GNU General Public License v3.0**许可证的约束。

## 技术栈

Pug + Sass + TypeScript + React + antd + Webpack + Electron。包管理工具使用corepack。   
使用playwright + @playwright/test进行e2e测试。

## 模块

* 48tools: 软件源代码。
* app：编译程序主目录。
* main：Electron主程序运行源代码。
* test：e2e测试。

## 开发

1. main模块：进入`packages/main`，运行`npm run start`，开发主程序源代码；或运行`npm run dev`，编译开发环境的主程序源代码。
2. 48tools模块：进入`packages/48tools`，运行`npm run dll`，然后运行`npm run start`。
3. 48tools模块：进入`packages/48tools`，运行`npm run runel`，启动软件。

## 编译

> 运行`node scripts/delivery.mjs`，完成整个编译过程。

1. main模块：进入`packages/main`，运行`npm run build`，编译主程序源代码。
2. 48tools模块：进入`packages/48tools`，运行`npm run build`，编译软件源代码。
3. 运行`node scripts/unpack.mjs`，打包软件。
4. 运行`node scripts/clean.mjs`，删除软件中的无用的文件。

## 测试

进入`packages/test`，运行`npm run test`，运行e2e测试。

## 源代码托管地址

github：[https://github.com/duan602728596/48tools](https://github.com/duan602728596/48tools)。   
gitee同步地址：[https://gitee.com/duanhaochen/a48tools](https://gitee.com/duanhaochen/a48tools)。