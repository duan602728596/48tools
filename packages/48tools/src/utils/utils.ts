import * as fs from 'node:fs';
import * as net from 'node:net';
import type { Server as NetServer } from 'node:net';
import * as os from 'node:os';
import { chromium, firefox, webkit, type BrowserType } from 'playwright-core';
import * as dayjs from 'dayjs';
import { BILIBILI_COOKIE_KEY, type BilibiliCookie } from '../functionalComponents/BilibiliLogin/Qrcode';
import { ACFUN_COOKIE_KEY, type AcFunCookie } from '../functionalComponents/AcFunLogin/Qrcode';

/* 获取ffmpeg的地址 */
export function getFFmpeg(): string {
  const ffmpegPath: string | null = localStorage.getItem('FFMPEG_PATH'); // 本机配置

  if (ffmpegPath && fs.existsSync(ffmpegPath)) {
    return ffmpegPath;
  }

  return 'ffmpeg';
}

/* 随机字符串 */
export function rStr(len: number): string {
  const str: string = 'QWERTYUIOPASDFGHJKLZXCVBNM1234567890';
  let result: string = '';

  for (let i: number = 0; i < len; i++) {
    const rIndex: number = Math.floor(Math.random() * str.length);

    result += str[rIndex];
  }

  return result;
}

/* 获取bilibili的cookie */
export function getBilibiliCookie(): string | undefined {
  const cookieStr: string | null = localStorage.getItem(BILIBILI_COOKIE_KEY);

  if (!cookieStr) {
    return undefined;
  }

  const cookie: BilibiliCookie = JSON.parse(cookieStr);

  return cookie.cookie;
}

/* 获取acfun的cookie */
export function getAcFuncCookie(): string | undefined {
  const cookieStr: string | null = localStorage.getItem(ACFUN_COOKIE_KEY);

  if (!cookieStr) {
    return undefined;
  }

  const cookie: AcFunCookie = JSON.parse(cookieStr);

  return cookie.cookie;
}

// 格式化文件的时间戳的格式
export const fileTimeFormat: string = 'YYYY-MM-DD~HH.mm.ss';

/**
 * 生成适合文件路径的时间
 * @param { number | string } value: 时间戳
 */
export function getFileTime(value?: number | string): string {
  if (value) {
    return dayjs(typeof value === 'string' ? Number(value) : value).format(fileTimeFormat);
  } else {
    return dayjs().format(fileTimeFormat);
  }
}

/**
 * 检查端口占用情况
 * @param { number } port: 检查的端口
 */
export function portIsOccupied(port: number): Promise<boolean> {
  return new Promise(function(resolve: Function, reject: Function): void {
    const server: NetServer = net.createServer().listen(port);

    server.on('listening', (): void => {
      server.close();
      resolve(true);
    });

    server.on('error', (err: Error): void => {
      server.close();
      resolve(false);
    });
  });
}

/**
 * 判断端口是否被占用，并返回新的端口
 * @param { number } port: 检查的端口
 * @param { Array<number> } ignorePort: 忽略的端口
 */
export async function detectPort(port: number, ignorePort: Array<number> = []): Promise<number> {
  let maxPort: number = port + 10; // 最大端口
  let newNumber: number = port,    // 使用的端口
    pt: number = port;

  if (maxPort > 65535) {
    maxPort = 65535;
  }

  while (pt <= maxPort) {
    const portCanUse: boolean = await portIsOccupied(pt);

    if (portCanUse && !ignorePort.includes(pt)) {
      newNumber = pt;
      break;
    } else {
      pt++;
    }
  }

  return newNumber;
}

/* 根据路径获取不同的启动器 */
export function getBrowser(executablePath: string): BrowserType {
  if (/Safari/i.test(executablePath)) {
    return webkit;
  } else if (/(Firefox|火狐)/i.test(executablePath)) {
    return firefox;
  } else {
    return chromium;
  }
}

/* 获取executablePath的路径 */
export function getExecutablePath(): string | null {
  const executablePath: string | null = localStorage.getItem('PUPPETEER_EXECUTABLE_PATH');

  return executablePath;
}

// pc端ua
export const pcUserAgent: string = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 '
  + '(KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36 Edg/109.0.1518.52';

const isWin: boolean = os.platform() === 'win32';
const isMac: boolean = os.platform() === 'darwin';

export const ffmpegInstallHtmlPage: string = (({ isWin: _isWin, isMac: _isMac }: { isWin: boolean; isMac: boolean }): string => {
  if (_isWin) return 'https://www.gyan.dev/ffmpeg/builds/';

  if (_isMac) return 'https://evermeet.cx/ffmpeg/';

  return 'https://www.ffmpeg.org/download.html';
})({ isWin, isMac });