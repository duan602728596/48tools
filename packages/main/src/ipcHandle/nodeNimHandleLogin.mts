import { ipcMain, type IpcMainInvokeEvent } from 'electron';
import NodeNim from 'node-nim';
import type { NIMResCode, LoginRes } from 'node-nim';
import { NodeNimLoginHandleChannel } from '../channelEnum.js';
import { require } from '../utils.mjs';

const nimLoginAccountSet: Set<string> = new Set();

interface NodeNimLoginOptions {
  appKey: string;
  account: string;
  token: string;
  appDataDir: string;
  roomId: number;
}

export let nodeNimInitiated: boolean = false;

export function nodeNimCleanup(): void {
  if (nodeNimInitiated) {
    const node_nim: typeof NodeNim = require('node-nim');

    nodeNimInitiated && node_nim.nim.client.cleanup('');
  }
}

/* NodeNim相关 */
export function nodeNimHandleLogin(): void {
  // NIM登录
  ipcMain.handle(
    NodeNimLoginHandleChannel.NodeNimLogin,
    async function(event: IpcMainInvokeEvent, options: NodeNimLoginOptions): Promise<string | null> {
      const node_nim: typeof NodeNim = require('node-nim');

      if (!nodeNimInitiated) {
        const clientInitResult: boolean = node_nim.nim.client.init(atob(options.appKey), options.appDataDir, '', {});

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
}