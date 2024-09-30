import { promisify } from 'node:util';
import { brotliCompress } from 'node:zlib';
import fsPromise from 'node:fs/promises';
import path from 'node:path';
import { glob } from 'glob';
import { outputFile, remove } from 'fs-extra/esm';
import { metaHelper } from '@sweet-milktea/utils';

const { __dirname } = metaHelper(import.meta.url);
const brotliCompressPromise = promisify(brotliCompress);

const dist = path.join(__dirname, 'dist');
const sourcemapDir = path.join(dist, '_$M_');
const resultArray = [];

/**
 * 格式化输出
 * @param { number } bytes
 * @return { string }
 */
function formatBytes(bytes) {
  const [a, b, c] = [1024, 1024 ** 2, 1024 ** 3];

  if (bytes < a) {
    return `${ bytes } Bytes`;
  } else if (bytes < b) {
    return `${ (bytes / a).toFixed(3) } KB`;
  } else if (bytes < c) {
    return `${ (bytes / b).toFixed(3) } MB`;
  } else {
    return `${ (bytes / c).toFixed(3) } GB`;
  }
}

/**
 * 压缩文件和修改地址
 * @param { string } name - sourcemap文件名
 */
async function sourcemapBrAndModifyUrl(name) {
  const originalFileName = name.replace(/\.map$/, ''); // 原始文件
  const originalFile = path.join(dist, originalFileName), // 原始文件路径
    sourcemapFile = path.join(dist, name); // sourcemap文件路径

  // 压缩并输出文件
  const sourcemapStr = await fsPromise.readFile(sourcemapFile, { encoding: 'utf8' });
  const sourcemapBr = await brotliCompressPromise(sourcemapStr);
  const sourcemapBrFile = path.join(sourcemapDir, `${ name }.br`);

  await outputFile(sourcemapBrFile, sourcemapBr, { encoding: 'binary' });

  // 修改地址
  const originalFileStr = await fsPromise.readFile(originalFile, { encoding: 'utf8' });
  const newOriginalFileStr = originalFileStr.replace(`sourceMappingURL=${ name }`, `sourceMappingURL=http://localhost:25110/proxy/s1/${ name }`);

  await outputFile(originalFile, newOriginalFileStr, { encoding: 'utf8' });

  // 读取文件大小
  const beforeSize = (await fsPromise.stat(sourcemapFile)).size;
  const afterSize = (await fsPromise.stat(sourcemapBrFile)).size;

  resultArray.push({
    Name: name,
    'Original File Size': formatBytes(beforeSize),
    'Compress File Size': formatBytes(afterSize)
  });

  // 删除原文件
  await remove(sourcemapFile);
}

/* 压缩文件 */
const mapFiles = await glob('*.map', {
  cwd: path.join(__dirname, 'dist')
});

await Promise.all(mapFiles.map((name) => sourcemapBrAndModifyUrl(name)));
console.table(resultArray, ['Name', 'Original File Size', 'Compress File Size']);