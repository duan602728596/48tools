import path from 'node:path';
import os from 'node:os';
import { metaHelper } from '@sweet-milktea/utils';

const { __dirname }: { __dirname: string } = metaHelper(import.meta.url);

// 测试用ffmpeg的文件地址
export const ffmpegPath: string = path.join(__dirname, `../../ffmpeg/bin/ffmpeg${ os.platform() === 'win32' ? '.exe' : '' }`);

// 临时文件
export const testDir: string = path.join(__dirname, '../../dist');

// 视频地址
export const mediaDir: string = path.join(testDir, 'media');

// bilibili文件夹
export const bilibiliDir: string = path.join(testDir, 'bilibili');

// acfun的文件夹
export const acfunDir: string = path.join(testDir, 'acfun');