import fs from 'node:fs';
import fsPromises from 'node:fs/promises';
import { ipcMain, type IpcMainInvokeEvent } from 'electron';
import type NodeNim from 'node-nim';
import type { NIMResCode, LoginRes } from 'node-nim';
import { NodeNimLoginHandleChannel } from '../channelEnum.js';
import { require, isWindowsArm } from '../utils.mjs';

const nimLoginAccountSet: Set<string> = new Set(); // 记录当前已登录的账号
let nodeNimInitiated: boolean = false;             // 记录NodeNim是否已初始化

/* 加载node-nim模块 */
function requireNodeMim(): typeof NodeNim {
  const nodeNim: { default: typeof NodeNim } | typeof NodeNim = require('node-nim');

  return 'default' in nodeNim ? nodeNim.default : nodeNim;
}

/* 窗口关闭后需要清除和重置状态 */
export function nodeNimCleanup(): void {
  if (!isWindowsArm) {
    const node_nim: typeof NodeNim = requireNodeMim();

    node_nim.nim.client.cleanup('');
    nodeNimInitiated = false;
    nimLoginAccountSet.clear();
  }
}

/* 清除app data目录 */
async function deleteAppDataDir(appDataDir: string): Promise<void> {
  if (fs.existsSync(appDataDir)) {
    try {
      await fsPromises.rm(appDataDir, { recursive: true });
    } catch { /* noop */ }
  }
}

interface NodeNimLoginOptions {
  appKey: string;
  account: string;
  token: string;
  appDataDir: string;
  roomId: number;
}

/* NodeNim相关 */
export function nodeNimHandleLogin(): void {
  // NIM登录
  ipcMain.handle(
    NodeNimLoginHandleChannel.NodeNimLogin,
    async function(event: IpcMainInvokeEvent, options: NodeNimLoginOptions): Promise<string | null> {
      if (isWindowsArm) return null;

      const node_nim: typeof NodeNim = requireNodeMim();

      if (!nodeNimInitiated) {
        // 清除app data目录
        await deleteAppDataDir(options.appDataDir);

        const clientInitResult: boolean = node_nim.nim.client.init(
          atob(options.appKey), options.appDataDir, '', {});

        if (!clientInitResult) return null;

        node_nim.nim.initEventHandlers();
        nodeNimInitiated = true;
      }

      // 登录
      if (!nimLoginAccountSet.has(options.account)) {
        const [loginRes]: [LoginRes] = await node_nim.nim.client.login(
          atob(options.appKey), options.account, options.token, null, '');

        if (loginRes.res_code_ !== node_nim.NIMResCode.kNIMResSuccess) return null;

        nimLoginAccountSet.add(options.account);
      }

      const [resEnterCode, roomEnterResult]: [NIMResCode, string] = await node_nim.nim.plugin.chatRoomRequestEnterAsync(
        options.roomId, null, '');

      if (resEnterCode !== node_nim.NIMResCode.kNIMResSuccess) return null;

      return roomEnterResult;
    });

  // 清理NodeNim
  ipcMain.handle(
    NodeNimLoginHandleChannel.NodeNimClean,
    async function(event: IpcMainInvokeEvent, options: Pick<NodeNimLoginOptions, 'appDataDir'>): Promise<void> {
      nodeNimCleanup();
      await deleteAppDataDir(options.appDataDir);
    });
}