# 开发说明

## 环境依赖
需要安装node。

## 文件夹结构
* nwjs: nwjs SDK
  * app: 源代码
  * dependent: 依赖的文件存储目录
    * ffmpeg: ffmpeg
  * output: 视频、Excel等文件的输出目录

## 开发环境   
1、下载nwjs的SDK文件，并解压。   
2、把下载后的代码源文件放在SDK文件夹内。   
3、下载ffmpeg，把ffmpeg.exe文件放在`dependent/ffmpeg`文件夹内。   
4、进入app文件夹，运行`npm install`或`yarn install`，安装开发环境依赖包。   
5、运行`npm run devdll`或`yarn run devdll`编译dll文件。   
6、运行`npm run start`或`yarn run start`编译文件。   
7、运行bat脚本或bat编译的exe文件（不是nw.exe）。   

## 生产环境
1、下载nwjs文件，并解压。   
2、将文件和文件夹结构复制到发布文件的目录。   
3、在之前的开发环境运行`npm run prodll`或`yarn run prodll`编译dll文件。   
4、之前的开发环境运行`npm run build`或`yarn run build`编译文件。   
5、将build文件夹和package.json文件复制到发布环境的app文件夹内。   
6、在发布环境的app文件夹内运行`npm run proinstall`或`yarn run proinstall`安装依赖。   