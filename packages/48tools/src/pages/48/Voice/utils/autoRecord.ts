import * as path from 'node:path';
import type { Store } from '@reduxjs/toolkit';
import type { MessageInstance } from 'antd/es/message/interface';
import { requestVoiceOperate, type VoiceOperate } from '@48tools-api/48';
import { store } from '../../../../store/store';
import getFFmpegDownloadWorker from '../../../../utils/worker/FFmpegDownload.worker/getFFmpegDownloadWorker';
import {
  setAddDownloadWorker,
  setRemoveDownloadWorker,
  setAutoRecord,
  roomVoiceListSelectors
} from '../../reducers/roomVoice';
import { getFFmpeg, getFileTime, rStr } from '../../../../utils/utils';
import type { RoomVoiceItem } from '../../types';
import type { UserInfo } from '../../../../functionalComponents/Pocket48Login/types';
import type { MessageEventData, WebWorkerChildItem } from '../../../../commonTypes';

/* 创建worker */
function createWorker( messageApi: MessageInstance, voiceItem: RoomVoiceItem, playStreamPath: string, saveDir: string): void {
  const { dispatch }: Store = store;
  const time: string = getFileTime();
  const tsFilePath: string = path.join(saveDir,
    `[口袋48房间电台]${ voiceItem.nickname }_${ voiceItem.serverId }_${ voiceItem.channelId }_${ time }_${ rStr(5) }.ts`);
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

/* 监听并录制 */
async function record(messageApi: MessageInstance, voiceItem: RoomVoiceItem, saveDir: string): Promise<void> {
  // 先判断是否开始
  const roomVoiceWorkerList: Array<WebWorkerChildItem> = roomVoiceListSelectors.selectAll(store.getState().roomVoice);
  const workerIndex: number = roomVoiceWorkerList.findIndex((o: WebWorkerChildItem): boolean => o.id === voiceItem.id);

  if (workerIndex < 0) {
    const res: VoiceOperate | undefined = await requestVoiceOperate(voiceItem.serverId, voiceItem.channelId);

    if (res && res?.content?.streamUrl) {
      createWorker(messageApi, voiceItem, res.content.streamUrl, saveDir);
    }
  }
}

/**
 * 自动录制
 * @param { MessageInstance } messageApi
 * @param { string } saveDir - 自动保存的目录
 */
export async function startAutoRecord(messageApi: MessageInstance, saveDir: string): Promise<boolean> {
  const roomVoice: Array<RoomVoiceItem> = store.getState().roomVoice.roomVoice
    .filter((o: RoomVoiceItem): boolean => !!o.autoRecord)
    .slice(0, 5);
  const userInfo: UserInfo | null = store.getState().pocket48Login.userInfo;

  if (!userInfo) {
    messageApi.error('自动录制失败！请先登录。');
    store.dispatch(setAutoRecord(null));

    return false;
  }

  for (const item of roomVoice) {
    await record(messageApi, item, saveDir);
  }

  return true;
}

/* 停止自动录制 */
export function stopAutoRecord(): void {
  store.dispatch(setAutoRecord(null));
}
