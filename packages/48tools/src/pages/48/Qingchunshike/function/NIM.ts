import NIMSDK from '@yxim/nim-web-sdk/dist/SDK/NIM_Web_SDK.js';
import type NIM_Web_Chatroom from '@yxim/nim-web-sdk/dist/SDK/NIM_Web_Chatroom';
import type { NIMChatroomMessage } from '@yxim/nim-web-sdk/dist/SDK/NIM_Web_Chatroom/NIMChatroomMessageInterface';
import appKey from '../../../PlayerWindow/sdk/appKey.mjs';

class NIM {
  chatroom: NIM_Web_Chatroom | null = null;
  account: string;
  pwd: string;
  roomId: number;

  constructor(account: string, pwd: string, roomId: number) {
    this.account = account;
    this.pwd = pwd;
    this.roomId = roomId;
  }

  init(): Promise<void> {
    return new Promise((resolve: Function): void => {
      this.chatroom = NIMSDK.Chatroom.getInstance({
        appKey: atob(appKey),
        account: this.account,
        token: this.pwd,
        db: false,
        dbLog: false,
        chatroomId: this.roomId,
        chatroomAddresses: ['chatweblink01.netease.im:443'],
        onconnect(event: any): void {
          resolve();
        }
      });
    });
  }

  // 断开连接
  disconnect(): void {
    this.chatroom?.disconnect?.({ done(): void { /* noop */ } });
    this.chatroom = null;
  }

  // 获取聊天信息
  getHistoryMessage(timeTag?: number): Promise<Array<NIMChatroomMessage>> {
    return new Promise((resolve: Function): void => {
      this.chatroom!.getHistoryMsgs({
        timetag: timeTag,
        // @ts-ignore
        done(err: Error, data: { msgs: Array<NIMChatroomMessage> }): void {
          console.log(data);
          resolve(data.msgs ?? []);
        }
      });
    });
  }
}

export default NIM;