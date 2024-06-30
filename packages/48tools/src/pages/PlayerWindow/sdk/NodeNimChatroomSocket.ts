import * as path from 'node:path';
import { ipcRenderer } from 'electron';
import type * as NodeNim from 'node-nim';
import type { NIMChatRoomEnterStep, ChatRoomInfo, ChatRoomMemberInfo, ChatRoomMessage } from 'node-nim';
import { NodeNimLoginHandleChannel } from '@48tools/main/src/channelEnum';
import appKey from './appKey.mjs';

type OnMessage = (t: NodeNimChatroomSocket, event: Array<ChatRoomMessage>) => void | Promise<void>;

export const nodeNim: typeof NodeNim | undefined = ((): typeof NodeNim | undefined => {
  let node_nim: typeof NodeNim | undefined = undefined;

  try {
    const nodeNimModule: { default: typeof NodeNim } | typeof NodeNim = globalThis.require('node-nim');

    node_nim = 'default' in nodeNimModule ? nodeNimModule.default : nodeNimModule;
  } catch { /* noop */ }

  return node_nim;
})();

/* 网易云信C++ sdk的socket连接 */
class NodeNimChatroomSocket {
  public account: string;
  public token: string;
  public roomId: number;
  public appDataDir: string;
  public chatroomRequestLoginResult: string;
  public chatroom: NodeNim.ChatRoom | undefined;
  public onMessage?: OnMessage;

  constructor(account: string, token: string, roomId: number, appDataDir: string, onMessage?: OnMessage) {
    this.account = account; // 账号
    this.token = token;     // token
    this.roomId = roomId;   // 房间id
    this.appDataDir = path.join(appDataDir, '_48tools_node_nim_app_data_', account); // app数据目录
    this.onMessage = onMessage;
  }

  // chatroom初始化
  chatroomInit(): Promise<void> {
    return new Promise((resolve: Function, reject: Function): void => {
      this.chatroom = new nodeNim!.ChatRoom();
      this.chatroom.init('', '');
      this.chatroom.initEventHandlers();

      this.chatroom.on('enter', (
        rid: number,
        status: NIMChatRoomEnterStep,
        status2: number,
        roomInfo: ChatRoomInfo,
        myInfo: ChatRoomMemberInfo
      ): void => {
        if (status === 5 && status2 === 200) {
          console.log('Chatroom连接成功', roomInfo);

          if (this.onMessage) {
            this.chatroom!.on('receiveMsg', (n: number, msg: ChatRoomMessage): void => {
              this.onMessage!(this, [msg]);
            });
          }

          resolve();
        }
      });

      this.chatroom.enter(this.roomId, this.chatroomRequestLoginResult, {}, '');
    });
  }

  async init(): Promise<boolean> {
    if (!nodeNim) return false;

    const chatroomRequestLoginResult: string | null = await ipcRenderer.invoke(NodeNimLoginHandleChannel.NodeNimLogin, {
      appKey,
      account: this.account,
      token: this.token,
      appDataDir: this.appDataDir,
      roomId: this.roomId
    });

    console.log('获取Chatroom登录结果: ', chatroomRequestLoginResult);

    if (!chatroomRequestLoginResult) return false;

    this.chatroomRequestLoginResult = chatroomRequestLoginResult;
    await this.chatroomInit();

    return true;
  }

  exit(): void {
    if (this.chatroom) {
      this.chatroom.exit(this.roomId, '');
      this.chatroom.cleanup('');
    }
  }

  async clean(): Promise<void> {
    await ipcRenderer.invoke(NodeNimLoginHandleChannel.NodeNimClean, {
      appDataDir: this.appDataDir
    });
  }

  async getHistoryMessage(timeTag?: number): Promise<Array<ChatRoomMessage> | undefined> {
    if (!(this.chatroom && nodeNim)) return;

    const result: [number, number, Array<ChatRoomMessage>] = await this.chatroom.getMessageHistoryOnlineAsync(
      this.roomId, {
        start_timetag_: timeTag,
        limit_: 20
      }, null, '');

    return result[2];
  }
}

export default NodeNimChatroomSocket;