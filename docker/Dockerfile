# 在Docker中下载48tools
# 参考：https://jaked.org/blog/2021-02-18-How-to-run-Electron-on-Linux-on-Docker-on-Mac
#
# 命令参考
# 构建：docker image build -t 48tools:0.0.1 .
# 启动：docker container run -it 48tools:0.0.1 /bin/bash
# 列出容器：docker container ls --all
# 停止容器：docker container kill <container id>
# 删除容器：docker container rm <container id>

# 构建Nodejs环境
FROM node:20.3.0 AS install-48tools

# 软件版本
ENV VERSION=3.23.3

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
RUN node install.mjs

# The SUID sandbox helper binary was found, but is not configured correctly.
# Rather than run without sandboxing I'm aborting now.
# You need to make sure that /48tools/48tools-3.23.3-linux64/chrome-sandbox is owned by root and has mode 4755.
RUN chown root /48tools/48tools-3.23.3-linux64/chrome-sandbox
RUN chmod 4755 /48tools/48tools-3.23.3-linux64/chrome-sandbox
RUN useradd -d /48tools user48tools

# 启动后执行：su user48tools && cd 48tools-3.23.3-linux64