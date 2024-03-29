import { pipeline } from 'node:stream/promises';
import { createWriteStream } from 'node:fs';
import path from 'node:path';
import got from 'got';
import { JSDOM } from 'jsdom';
import fse from 'fs-extra';
import zip from 'cross-zip';
import { metaHelper } from '@sweet-milktea/utils';

const { __dirname } = metaHelper(import.meta.url);

const ffmpegDir = path.join(__dirname, 'ffmpeg');
const ffmpegZipFile = path.join(ffmpegDir, 'ffmpeg.zip');

const gotReqOptions = {
  responseType: 'text',
  timeout: {
    lookup: 120_000,
    connect: 120_000,
    secureConnect: 120_000,
    socket: 120_000,
    send: 120_000,
    response: 180_000
  }
};

/* 获取mac版本的url */
async function getMacFFmpegUrl() {
  const ffmpegDownloadUrl = 'https://evermeet.cx/ffmpeg/';
  const res = await got.get(ffmpegDownloadUrl, gotReqOptions);
  const { document: jsdomDocument } = new JSDOM(res.body).window;
  const href = jsdomDocument.querySelectorAll('.btn-download-wrapper')[1]
    .querySelectorAll('a')[2]
    .getAttribute('href');

  return `${ ffmpegDownloadUrl }${ href }`;
}

/* 下载 */
async function downloadFFMpegZip(href) {
  console.log(`获取到下载地址：${ href }`);
  await fse.ensureDir(ffmpegDir);

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

const downloadUrl = await getMacFFmpegUrl();

await downloadFFMpegZip(downloadUrl);
await zip.unzip(ffmpegZipFile, path.join(ffmpegDir, 'bin'));