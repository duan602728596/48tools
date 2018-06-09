# 口袋48工具

## 软件下载链接
进入到[https://github.com/duan602728596/document/blob/master/48/README.md](https://github.com/duan602728596/document/blob/master/48/README.md)下载

## 功能
* 成员直播录源
* 成员录播下载
* B站视频录源
* 视频剪切
* 视频合并
* 摩点项目集资统计功能
* 公演录播回放视频下载功能
* 官方源录制

## ROOMID获取方法
B站直播已改版，ROOMID获取方式如下：
https://api.live.bilibili.com/room/v1/Room/room_init?id={{ ID }}，GET请求。

## 许可证
本软件遵循**GNU General Public License v3.0**许可证。

## 技术栈
Pug + Sass + ECMAScript + React + AntD + Webpack + NW.js。

## 编译命令
* 输入命令 `$ npm start` 运行开发环境。
* 输入命令 `$ npm build` 编译到文件夹。
* 输入命令 `$ npm run devdll` 编译开发环境dll文件。
* 输入命令 `$ npm run prodll` 编译生产环境编译dll文件。
* 输入命令 `$ npm run npmi` 或 `$ yarn run yarni` 安装生产环境依赖。

## nwjs中文文档
[https://wizardforcel.gitbooks.io/nwjs-doc/content/wiki/index.html](https://wizardforcel.gitbooks.io/nwjs-doc/content/wiki/index.html)

## 谷歌扩展
* 教程参考：[http://www.ituring.com.cn/book/1421](http://www.ituring.com.cn/book/1421)
* api文档：[https://developer.chrome.com/extensions/api_index](https://developer.chrome.com/extensions/api_index)

## 文件夹结构
* nwjs: nwjs SDK
  * app: 源代码
  * dependent: 依赖的文件存储目录
    * ffmpeg: ffmpeg（20180124版本在windows上会出现错误，导致无法运行命令，错误代码3221225781，应避免使用此版本。）
  * output: window环境下的视频、Excel等文件的输出目录；mac下输出到**下载**目录

## 关于dll
无论是开发环境还是生产环境，首先要编译dll文件，将公共模块提取出来。

## 关于node-sass
node-sass如果安装失败，可以先到[https://github.com/sass/node-sass/releases](https://github.com/sass/node-sass/releases)下载binding.node文件，然后将该文件添加到SASS_BINARY_PATH环境变量内。

## video无法观看的解决办法
请到[https://github.com/iteufel/nwjs-ffmpeg-prebuilt/releases](https://github.com/iteufel/nwjs-ffmpeg-prebuilt/releases)地址下载对应的ffmpeg.dll并覆盖到源目录中

## 打包方法
* 将文件夹内的文件打包成压缩文件，并重命名为*.nw
* 将*.nw复制到和nw.exe同级目录下，运行
```
$ copy /b nw.exe+*.nw *.exe
```

## 源代码托管地址
[https://github.com/duan602728596/48tools](https://github.com/duan602728596/48tools)