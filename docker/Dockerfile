# 在Docker中下载48tools
# 参考：https://jaked.org/blog/2021-02-18-How-to-run-Electron-on-Linux-on-Docker-on-Mac
# 构建image文件：docker image build -t 48tools:0.0.1 .
# 启动：docker container run -it 48tools:0.0.1 /bin/bash

# 构建Nodejs环境
FROM node:20.3.0 AS install-48tools

# 安装GUI支持
RUN apt-get update \
    && apt-get install libx11-xcb1 libxcb-dri3-0 libxtst6 libnss3 libatk-bridge2.0-0 libgtk-3-0 libxss1 libasound2 \
                       libdrm2 libice6 libsm6 libgbm-dev \
       -yq --no-install-suggests --no-install-recommends \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# 进入文件夹
WORKDIR /48tools

# 将脚本拷贝到文件夹中
COPY ./ /48tools

# 安装依赖并下载 48tools-*-linux64.zip 48tools-*-linux64
RUN npm install
RUN npm run docker-install