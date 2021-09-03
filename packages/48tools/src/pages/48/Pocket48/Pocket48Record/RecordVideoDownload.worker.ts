import { promisify } from 'util';
import { pipeline } from 'stream';
import * as fs from 'fs';
import { promises as fsP } from 'fs';
import * as path from 'path';
import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
import got from 'got';

const pipelineP: (stream1: NodeJS.ReadableStream, stream2: NodeJS.WritableStream) => Promise<void> = promisify(pipeline);

/**
 * 口袋48录播下载线程
 */
export type WorkerEventData = {
  ffmpeg: string;         // ffmpeg地址
  type: 'start' | 'stop'; // 执行的方法
  playStreamPath: string; // 文件夹内的m3u8文件地址
  filePath: string;       // 文件夹地址
};

let child: ChildProcessWithoutNullStreams;
let isStop: boolean = false; // 已经停止

/**
 * 下载文件
 * @param { string } fileUrl: 文件url地址
 * @param { string } filename: 文件本地地址
 */
export async function requestDownloadFileByStream(fileUrl: string, filename: string): Promise<void> {
  await pipelineP(got.stream(fileUrl), fs.createWriteStream(filename));
}

/**
 * 解析m3u8文件并生成合并清单
 * @param { string } cacheDir: 文件夹
 * @param { string } playStreamPath: m3u8文件
 */
async function parseM3u8File(cacheDir: string, playStreamPath: string): Promise<Array<string>> {
  const data: string = await fsP.readFile(playStreamPath, { encoding: 'utf8' });
  const dataArr: string[] = data.split('\n');

  return dataArr.filter((o: string): boolean => /^https?/i.test(o));
}

/**
 * 生成txt文件
 * @param { string } concatTxt: txt文件
 * @param { Array<string> } urls: ts合集
 */
async function createTxtFile(concatTxt: string, urls: Array<string>): Promise<void> {
  const txt: string[] = urls.map((o: string): string => `file '${ path.basename(o) }'`);

  await fsP.writeFile(concatTxt, txt.join('\n'), { encoding: 'utf8' });
}

/**
 * 下载视频
 * @param { string } cacheDir: 文件夹
 * @param { Array<string> } urls: ts合集
 */
async function downloadTsVideos(cacheDir: string, urls: Array<string>): Promise<void> {
  for (const uri of urls) {
    if (isStop) {
      break;
    }

    const name: string = path.basename(uri);
    const ts: string = path.join(cacheDir, name);

    await requestDownloadFileByStream(uri, ts);
  }
}

/* 下载 */
async function download(workerData: WorkerEventData): Promise<void> {
  const { ffmpeg, playStreamPath, filePath }: WorkerEventData = workerData;
  const cacheDir: string = `${ filePath }.cache`;
  const concatTxt: string = path.join(cacheDir, '_a.txt');
  const urls: Array<string> = await parseM3u8File(cacheDir, playStreamPath);

  await createTxtFile(concatTxt, urls);
  await downloadTsVideos(cacheDir, urls);

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
    // @ts-ignore
    postMessage({ type: 'close' });
  });

  child.on('error', function(err: Error): void {
    // @ts-ignore
    postMessage({ type: 'error', error: err });
  });
}

/* 停止下载 */
function stop(): void {
  isStop = true;

  if (child) {
    child.kill('SIGTERM');
  } else {
    // @ts-ignore
    postMessage({ type: 'close' });
  }
}

addEventListener('message', function(event: MessageEvent<WorkerEventData>): void {
  const { type }: WorkerEventData = event.data;

  switch (type) {
    case 'start':
      download(event.data);
      break;

    case 'stop':
      stop();
      break;
  }
});