import * as path from 'node:path';
import type { Store } from '@reduxjs/toolkit';
import type { QChatMessage } from 'nim-web-sdk-ng/dist/QCHAT_BROWSER_SDK/QChatMsgServiceInterface';
import type { MessageInstance } from 'antd/es/message/interface';
import type { NotificationInstance } from 'antd/es/notification/interface';
import { store } from '../../../../store/store';
import QChatSocket from '../../sdk/QChatSocket';
import getFFmpegDownloadWorker from '../../../../utils/worker/getFFmpegDownloadWorker';
import {
  setAddDownloadWorker,
  setRemoveDownloadWorker,
  setAutoRecord,
  roomVoiceListSelectors
} from '../../reducers/roomVoice';
import { getFFmpeg, getFileTime, rStr } from '../../../../utils/utils';
import { requestVoiceOperate } from '../../services/pocket48';
import type { RoomVoiceItem, TeamVoiceMessage } from '../../types';
import type { UserInfo } from '../../../../functionalComponents/Pocket48Login/types';
import type { MessageEventData, WebWorkerChildItem } from '../../../../commonTypes';
import type { VoiceOperate } from '../../services/interface';

let QChatSocketList: Array<QChatSocket> = [];

type HandleRoomSocketMessageFunc = (event: QChatMessage | TeamVoiceMessage) => void;

/* 创建worker */
function createWorker( messageApi: MessageInstance, voiceItem: RoomVoiceItem, playStreamPath: string, saveDir: string): void {
  const time: string = getFileTime();
  const tsFilePath: string = path.join(saveDir,
    `[口袋48房间电台]${ voiceItem.nickname }_${ voiceItem.serverId }_${ voiceItem.channelId }_${ time }_${ rStr(5) }.ts`);
  const { dispatch }: Store = store;
  const worker: Worker = getFFmpegDownloadWorker();

  worker.addEventListener('message', function(event1: MessageEvent<MessageEventData>) {
    const { type, error }: MessageEventData = event1.data;

    if (type === 'close' || type === 'error') {
      if (type === 'error') {
        messageApi.error(`口袋48房间电台${ voiceItem.nickname }录制失败！`);
      }

      worker.terminate();
      dispatch(setRemoveDownloadWorker(voiceItem.id));
    }
  }, false);

  worker.postMessage({
    type: 'start',
    playStreamPath,
    filePath: tsFilePath,
    ffmpeg: getFFmpeg()
  });

  dispatch(setAddDownloadWorker({
    id: voiceItem.id,
    worker
  }));
}

/**
 * 创建onmsg的方法
 * @param { MessageInstance } messageApi: message
 * @param { RoomVoiceItem } voiceItem
 * @param { string } saveDir
 */
function createHandleRoomSocketMessage(
  messageApi: MessageInstance,
  voiceItem: RoomVoiceItem,
  saveDir: string
): HandleRoomSocketMessageFunc {
  return function(event: QChatMessage | TeamVoiceMessage): void {
    if (event.type === 'custom' && event.attach?.messageType === 'TEAM_VOICE') {
      const roomVoiceWorkerList: Array<WebWorkerChildItem> = roomVoiceListSelectors.selectAll(store.getState().roomVoice);
      const workerIndex: number = roomVoiceWorkerList.findIndex((o: WebWorkerChildItem): boolean => o.id === voiceItem.id);

      if (workerIndex < 0) {
        createWorker(messageApi, voiceItem, event.attach.voiceInfo.streamUrl, saveDir);
      }
    }
  };
}

/* 监听并录制 */
async function record(
  messageApi: MessageInstance,
  notificationApi: NotificationInstance,
  voiceItem: RoomVoiceItem,
  userInfo: UserInfo, saveDir: string
): Promise<void> {
  // 先判断是否开始
  const roomVoiceWorkerList: Array<WebWorkerChildItem> = roomVoiceListSelectors.selectAll(store.getState().roomVoice);
  const workerIndex: number = roomVoiceWorkerList.findIndex((o: WebWorkerChildItem): boolean => o.id === voiceItem.id);

  if (workerIndex < 0) {
    const res: VoiceOperate | undefined = await requestVoiceOperate(voiceItem.serverId, voiceItem.channelId);

    if (res && res?.content?.streamUrl) {
      createWorker(messageApi, voiceItem, res.content.streamUrl, saveDir);
    }
  }

  const serverId: string = `${ voiceItem.serverId }`;
  // 判断socket列表内是否有当前房间的socket连接
  const index: number = QChatSocketList.findIndex((o: QChatSocket): boolean => o.pocket48ServerId === serverId);

  if (index < 0) {
    const qChatSocket: QChatSocket = new QChatSocket({
      pocket48Account: userInfo.accid,
      pocket48Token: userInfo.pwd,
      pocket48ServerId: serverId,
      message: messageApi,
      notification: notificationApi
    });

    await qChatSocket.init();
    qChatSocket.addQueue({
      id: voiceItem.id,
      onmsgs: createHandleRoomSocketMessage(messageApi, voiceItem, saveDir)
    });
    QChatSocketList.push(qChatSocket); // 添加到列表
  } else {
    QChatSocketList[index].addQueue({
      id: voiceItem.id,
      onmsgs: createHandleRoomSocketMessage(messageApi, voiceItem, saveDir)
    });
  }
}

/**
 * 自动录制
 * @param { MessageInstance } messageApi
 * @param { NotificationInstance } notificationApi
 * @param { string } saveDir: 自动保存的目录
 */
export async function startAutoRecord(
  messageApi: MessageInstance,
  notificationApi: NotificationInstance,
  saveDir: string
): Promise<void> {
  const { dispatch }: Store = store;
  const roomVoice: Array<RoomVoiceItem> = store.getState().roomVoice.roomVoice
    .filter((o: RoomVoiceItem): boolean => !!o.autoRecord);
  const userInfo: UserInfo | null = store.getState().pocket48Login.userInfo;

  if (!userInfo) {
    messageApi.error('自动录制失败！请先登录。');

    return;
  }

  dispatch(setAutoRecord(true));

  for (const item of roomVoice) {
    await record(messageApi, notificationApi, item, userInfo, saveDir);
  }
}

/* 停止自动录制 */
export async function stopAutoRecord(): Promise<void> {
  const { dispatch }: Store = store;

  dispatch(setAutoRecord(false));

  for (const item of QChatSocketList) {
    await item.disconnect();
  }

  QChatSocketList = [];
}
