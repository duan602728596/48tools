import path from 'node:path';
import fsP from 'node:fs/promises';
import { promisify } from 'node:util';
import process from 'node:process';
import got from 'got';
import zip from 'cross-zip';
import { metaHelper } from '@sweet-milktea/utils';

const unzipPromise = promisify(zip.unzip);
const { __dirname } = metaHelper(import.meta.url);

// 获取版本号
async function getVersion() {
  const res = await fetch('https://fastly.jsdelivr.net/gh/duan602728596/48tools@main/lerna.json');
  const json = await res.json();

  return json.version;
}

// 下载文件
async function downloadZip(version) {
  const downloadUrl = `https://ghproxy.com/https://github.com/duan602728596/48tools/releases/download/v${
    version
  }/48tools-${ version }-linux64.zip`;

  console.log(`下载地址：${ downloadUrl }`);

  const res = await got.get(downloadUrl, {
    responseType: 'buffer'
  }).on('downloadProgress', function(progress) {
    console.log(`下载进度：${ (progress.percent * 100).toFixed(2) }%`);
  });

  return res.body;
}

async function install() {
  const version = process.env.VERSION || await getVersion();

  console.log('正在下载文件......');

  const arraybuffer = await downloadZip(version);

  console.log('下载文件完成，正在解压......');

  // 下载electron
  const zipFile = path.join(__dirname, `48tools-${ version }-linux64.zip`);
  const outputFile = path.join(__dirname);

  await fsP.writeFile(zipFile, arraybuffer, { encoding: null });
  await unzipPromise(zipFile, outputFile);

  console.log('解压完毕。');
}

install();