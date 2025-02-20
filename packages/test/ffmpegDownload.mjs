import { pipeline } from 'node:stream/promises';
import { createWriteStream, existsSync } from 'node:fs';
import path from 'node:path';
import { platform } from 'node:os';
import got from 'got';
import fse from 'fs-extra';
import zip from 'cross-zip';
import { unpack as unpack7z } from '7zip-min';
import { glob } from 'glob';
import { metaHelper } from '@sweet-milktea/utils';

const { __dirname } = metaHelper(import.meta.url);

const isMac = platform() === 'darwin',
  isWin = platform() === 'win32';

const ffmpegDownloadDir = path.join(__dirname, 'ffmpeg'); // ffmpeg下载目录
const ffmpegZipFile = path.join(ffmpegDownloadDir, `ffmpeg.${ isMac ? 'zip' : '7z' }`); // ffmpeg下载的压缩文件
const ffmpegBinDir = path.join(ffmpegDownloadDir, 'bin'); // ffmpeg可执行文件目录
const ffmpegExeFile = path.join(ffmpegBinDir, `ffmpeg${ isWin ? '.exe' : '' }`); // ffmpeg可执行文件

/* 获取url */
function getFFmpegZipDownloadUrl() {
  if (isMac) {
    return 'https://evermeet.cx/ffmpeg/getrelease/zip';
  } else {
    return 'https://www.gyan.dev/ffmpeg/builds/ffmpeg-git-full.7z';
  }
}

/**
 * 下载
 * @param { string } href - 下载地址
 */
async function downloadFFMpegZip(href) {
  console.log(`获取到下载地址：${ href }`);
  await fse.ensureDir(ffmpegDownloadDir);

  const readStream = got.stream.get(href, { throwHttpErrors: false });
  let old = null;

  readStream.on('downloadProgress', (progress) => {
    const percent = parseInt(String(progress.percent * 100));

    if (percent !== old) {
      old = percent;

      if (percent % 10 === 0) {
        console.log(`正在下载：${ percent }%`);
      }
    }
  });

  await pipeline(readStream, createWriteStream(ffmpegZipFile, { encoding: null }));
  console.log('下载完毕，正在解压......');
}

/* ffmpeg的下载 */
async function ffmpegDownload() {
  // 下载压缩包
  if (!existsSync(ffmpegZipFile)) {
    await downloadFFMpegZip(getFFmpegZipDownloadUrl());
  }

  // mac下仅解压缩
  if (isMac) {
    await zip.unzip(ffmpegZipFile, ffmpegBinDir);

    return;
  }

  // windows
  if (isWin) {
    await unpack7z(ffmpegZipFile, ffmpegBinDir);

    // 找到ffmpeg.exe文件并复制文件
    const [ffmpegWinPath] = await glob('**/ffmpeg.exe', { cwd: ffmpegBinDir });

    await fse.copy(path.join(ffmpegBinDir, ffmpegWinPath), path.join(ffmpegBinDir, 'ffmpeg.exe'));

    // 删除文件
    const [ffmpegWinDir] = ffmpegWinPath.split(/[\\/]/);

    await fse.remove(path.join(ffmpegBinDir, ffmpegWinDir));
  }
}

if (!existsSync(ffmpegExeFile)) {
  ffmpegDownload();
}