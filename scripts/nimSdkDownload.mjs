import util from 'node:util';
import path from 'node:path';
import zip from 'cross-zip';
import fse from 'fs-extra/esm';
import { sdkDownloadDir } from './utils.mjs';

const unzipPromise = util.promisify(zip.unzip);

const sdkDownloadPackage = {
  linux: 'node-nim-linux64.zip',
  mac: 'node-nim-mac.zip',
  macArm64: 'node-nim-mac-arm.zip',
  win64: 'node-nim-win64.zip',
  win32: 'node-nim-win32.zip'
};

/* 下载网易云信的C++ SDK */
async function download(package1, dir) {
  const res = await fetch(
    `https://github.com/duan602728596/48tools-nim-node-build/releases/download/v202406100105/${ package1 }`,
    {
      headers: {
        Host: 'github.com'
      }
    });
  const zipFile = path.join(dir, package1);

  await fse.outputFile(zipFile, Buffer.from(await res.arrayBuffer()));
  await unzipPromise(zipFile, dir);
}

async function nimSdkDownload() {
  await Promise.all([
    download(sdkDownloadPackage.linux, sdkDownloadDir.linux),
    download(sdkDownloadPackage.mac, sdkDownloadDir.mac),
    download(sdkDownloadPackage.macArm64, sdkDownloadDir.macArm64),
    download(sdkDownloadPackage.win64, sdkDownloadDir.win64),
    download(sdkDownloadPackage.win32, sdkDownloadDir.win32)
  ]);
}

export default nimSdkDownload;