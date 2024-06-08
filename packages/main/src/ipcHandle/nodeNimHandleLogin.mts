import { ipcMain, type IpcMainInvokeEvent } from 'electron';
import node_nim, { NIMResCode, type LoginRes } from 'node-nim';
import { NodeNimLoginHandleChannel } from '../channelEnum.js';

const nimLoginAccountSet: Set<string> = new Set();

interface NodeNimLoginOptions {
  appKey: string;
  account: string;
  token: string;
  appDataDir: string;
  roomId: number;
}

export let nodeNimInitiated: boolean = false;

/* NodeNim相关 */
export function nodeNimHandleLogin(): void {
  // NIM登录
  ipcMain.handle(
    NodeNimLoginHandleChannel.NodeNimLogin,
    async function(event: IpcMainInvokeEvent, options: NodeNimLoginOptions): Promise<string | null> {
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

        if (loginRes.res_code_ !== NIMResCode.kNIMResSuccess) return null;

        nimLoginAccountSet.add(options.account);
      }

      const [resEnterCode, roomEnterResult]: [NIMResCode, string] = await node_nim.nim.plugin.chatRoomRequestEnterAsync(
        options.roomId, null, '');

      if (resEnterCode !== NIMResCode.kNIMResSuccess) return null;

      return roomEnterResult;
    });
}