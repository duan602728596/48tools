import NIMSDK from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK';
import QChatSDK from 'nim-web-sdk-ng/dist/QCHAT_BROWSER_SDK';
import type {
  GetHistoryMessageOptions,
  QChatMessage
} from 'nim-web-sdk-ng/dist/QCHAT_BROWSER_SDK/QChatMsgServiceInterface';
import appKey from '../../../PlayerWindow/sdk/appKey.mjs';

/* QChat相关 */
class QChatSocket {
  nim: NIMSDK | null = null;
  qchat: QChatSDK | null = null;
  account: string;
  pwd: string;

  constructor(account: string, pwd: string) {
    this.account = account;
    this.pwd = pwd;
  }

  // 初始化
  init(): Promise<void> {
    return new Promise(async (resolve: Function): Promise<void> => {
      this.nim = new NIMSDK({
        appkey: atob(appKey),
        account: this.account,
        token: this.pwd
      });

      await this.nim.connect();
      this.qchat = new QChatSDK({
        appkey: atob(appKey),
        account: this.account,
        token: this.pwd,
        linkAddresses: await this.nim.plugin.getQChatAddress({ ipType: 2 })
      });

      this.qchat.on('logined', (): void => resolve());
      await this.qchat.login();
    });
  }

  // 断开连接
  async disconnect(): Promise<void> {
    await this.qchat?.logout?.();
    await this.qchat?.destroy?.();
    await this.nim?.destroy?.();
    this.qchat = null;
    this.nim = null;
  }

  // 读取聊天记录
  async getHistoryMessage(options: GetHistoryMessageOptions): Promise<QChatMessage[] | null> {
    if (!this.qchat) return null;

    const historyResult: Array<QChatMessage> = await this.qchat.qchatMsg.getHistoryMessage(options);

    return historyResult;
  }
}

export default QChatSocket;