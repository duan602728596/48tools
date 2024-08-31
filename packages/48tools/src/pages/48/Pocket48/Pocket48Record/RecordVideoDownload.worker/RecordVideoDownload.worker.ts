import { pipeline } from 'node:stream/promises';
import * as fs from 'node:fs';
import { promises as fsP, type BigIntStats } from 'node:fs';
import * as path from 'node:path';
import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';
// @ts-ignore
import got from 'got';
import type GotRequest from 'got/dist/source/core';

/**
 * 口袋48录播下载线程
 */
export type WorkerEventData = {
  ffmpeg: string;                   // ffmpeg地址
  type: 'start' | 'stop' | 'retry'; // 执行的方法
  playStreamPath: string;           // 文件夹内的m3u8文件地址
  filePath: string;                 // 文件夹地址
  qid?: string;
};

const ZERO_BIGINT: bigint = BigInt(0);
let child: ChildProcessWithoutNullStreams;
let isStop: boolean = false; // 已经停止
let downloadFileReq: GotRequest | null = null; // 正在下载的请求
let downloadFilePath: string | null = null;    // 正在下载的文件
let eventMessageData: WorkerEventData;

/**
 * 判断文件是否存在，并返回状态
 * @param { string } file
 */
async function stat(file: string): Promise<BigIntStats | null> {
  try {
    return await fsP.stat(file, { bigint: true });
  } catch (err) {
    return null;
  }
}

/**
 * 删除文件
 * @param { string } file
 */
async function rm(file: string): Promise<void> {
  await fsP.rm(file, { force: true, recursive: true });
}

/**
 * 解析参数
 * @param { string } uri
 */
function getUrlQuery(uri: string): string {
  const urlParse: URL = new URL(uri);

  return decodeURIComponent(urlParse.searchParams.get('url')!);
}

/**
 * 下载文件
 * @param { string } fileUrl - 文件url地址
 * @param { string } filename - 文件本地地址
 */
async function requestDownloadFileByStream(fileUrl: string, filename: string): Promise<void> {
  downloadFileReq = got.stream(fileUrl, {
    headers: {
      'Host': 'cychengyuan-vod.48.cn',
      'User-Agent': 'SNH48 ENGINE'
    }
  });

  if (downloadFileReq) {
    await pipeline(downloadFileReq, fs.createWriteStream(filename));
  }
}

/**
 * 解析m3u8文件并生成合并清单
 * @param { string } cacheDir - 文件夹
 * @param { string } playStreamPath - m3u8文件
 */
async function parseM3u8File(cacheDir: string, playStreamPath: string): Promise<Array<string>> {
  const data: string = await fsP.readFile(playStreamPath, { encoding: 'utf8' });
  const dataArr: string[] = data.split('\n');

  return dataArr.filter((o: string): boolean => /^https?/i.test(o));
}

/**
 * 生成txt文件
 * @param { string } concatTxt - txt文件
 * @param { Array<string> } urls - ts合集
 */
async function createTxtFile(concatTxt: string, urls: Array<string>): Promise<void> {
  const s: BigIntStats | null = await stat(concatTxt);

  if (s) return;

  const txt: string[] = urls.map((o: string): string => `file '${ path.basename(getUrlQuery(o)) }'`);

  await fsP.writeFile(concatTxt, txt.join('\n'), { encoding: 'utf8' });
}

/**
 * 下载视频
 * @param { string } cacheDir - 文件夹
 * @param { Array<string> } urls - ts合集
 * @param { string } [qid] - 唯一ID
 */
async function downloadTsVideos(cacheDir: string, urls: Array<string>, qid?: string): Promise<void> {
  const allFiles: number = urls.length + 1;
  let index: number = 0;

  for (const uri of urls) {
    downloadFileReq = downloadFilePath = null;

    if (isStop) {
      break;
    }

    const ts: string = path.join(cacheDir, path.basename(getUrlQuery(uri)));

    // 检查文件是否存在
    const s: BigIntStats | null = await stat(ts);

    if (s) {
      // 如果文件等于0，则删除
      if (!(s.size > ZERO_BIGINT)) {
        await rm(ts);
      }
    } else {
      downloadFilePath = ts;
      try {
        await requestDownloadFileByStream(uri, ts);
      } catch { /**/ }
    }

    index++;

    if (qid) {
      postMessage({
        type: 'progress',
        data: Math.floor(index / allFiles * 100),
        qid
      });
    }
  }
}

/* 下载 */
async function download(workerData: WorkerEventData): Promise<void> {
  isStop = false;

  const { ffmpeg, playStreamPath, filePath, qid }: WorkerEventData = workerData;
  const cacheDir: string = `${ filePath }.cache`;
  const concatTxt: string = path.join(cacheDir, '_a.txt');
  const urls: Array<string> = await parseM3u8File(cacheDir, playStreamPath);

  await createTxtFile(concatTxt, urls);
  await downloadTsVideos(cacheDir, urls, qid);

  if (isStop) return;

  const ffmpegArgs: Array<string> = ['-f', 'concat', '-safe', '0', '-i', concatTxt, '-c', 'copy', filePath];

  child = spawn(ffmpeg, ffmpegArgs);

  child.stdout.on('data', function(data: Buffer): void {
    // console.log(data.toString());
  });

  child.stderr.on('data', function(data: Buffer): void {
    // console.log(data.toString());
  });

  child.on('close', function(...args: string[]): void {
    postMessage({ type: 'close' });
  });

  child.on('error', function(err: Error): void {
    postMessage({ type: 'error', error: err });
  });
}

/* 停止下载 */
async function stop(): Promise<void> {
  isStop = true;
  try {
    downloadFileReq && downloadFileReq.destroy();
  } catch { /**/ }
  downloadFileReq = null;
  downloadFilePath && await rm(downloadFilePath);
  downloadFilePath = null;

  if (child) {
    child.kill('SIGTERM');
  } else {
    postMessage({ type: 'close' });
  }
}

/* 重试 */
async function retry(): Promise<void> {
  if (child) return;

  // 停止旧的ts文件下载
  isStop = true;
  try {
    downloadFileReq && downloadFileReq.destroy();
  } catch { /**/ }
  downloadFileReq = null;
  downloadFilePath && await rm(downloadFilePath);
  downloadFilePath = null;

  // 重新下载
  download(eventMessageData);
}

addEventListener('message', function(event: MessageEvent<WorkerEventData>): void {
  const { type }: WorkerEventData = event.data;

  switch (type) {
    case 'start':
      eventMessageData = event.data;
      download(event.data);
      break;

    case 'stop':
      stop();
      break;

    case 'retry':
      retry();
      break;
  }
});