import { ipcRenderer } from 'electron';
import type * as NodeNim from 'node-nim';
import type { NIMChatRoomEnterStep, ChatRoomInfo, ChatRoomMemberInfo, ChatRoomMessage } from 'node-nim';
import { NodeNimLoginHandleChannel } from '@48tools/main/src/channelEnum';
import appKey from './appKey.mjs';
import { isWindowsArm } from '../function/helper';

type OnMessage = (t: NodeNimChatroomSocket, event: Array<ChatRoomMessage>) => void | Promise<void>;

/* 网易云信C++ sdk的socket连接 */
class NodeNimChatroomSocket {
  #nodeMin: typeof NodeNim | undefined = undefined;
  public account: string;
  public token: string;
  public roomId: number;
  public appDataDir: string;
  public chatroomRequestLoginResult: string;
  public chatroom: NodeNim.ChatRoom | undefined;
  public onMessage: OnMessage;

  constructor(account: string, token: string, roomId: number, appDataDir: string, onMessage: OnMessage) {
    if (!isWindowsArm) {
      this.#nodeMin = globalThis.require('node-nim');
    }

    this.account = account; // 账号
    this.token = token;     // token
    this.roomId = roomId;   // 房间id
    this.appDataDir = appDataDir; // app数据目录
    this.onMessage = onMessage;
  }

  // chatroom初始化
  chatroomInit(): Promise<void> {
    return new Promise((resolve: Function, reject: Function): void => {
      this.chatroom = new this.#nodeMin!.ChatRoom();
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
          this.chatroom!.on('receiveMsg', (n: number, msg: ChatRoomMessage): void => {
            this.onMessage(this, [msg]);
          });
          resolve();
        }
      });

      this.chatroom.enter(this.roomId, this.chatroomRequestLoginResult, {}, '');
    });
  }

  async init(): Promise<boolean> {
    if (!this.#nodeMin) return false;

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
    this.chatroom?.exit?.(this.roomId, '');
  }
}

export default NodeNimChatroomSocket;