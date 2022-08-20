import path from 'node:path';
import { metaHelper } from '@sweet-milktea/utils';

const { __dirname }: { __dirname: string } = metaHelper(import.meta.url);

// 测试用ffmpeg的文件地址
export const ffmpegPath: string = path.join(__dirname, '../../ffmpeg/bin/ffmpeg');

export const testDir: string = path.join(__dirname, '../../dist');

// bilibili文件夹
export const bilibiliDir: string = path.join(testDir, 'bilibili');