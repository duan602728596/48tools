import type { SaveDialogReturnValue } from 'electron';
import type { Store } from '@reduxjs/toolkit';
import type { MessageInstance } from 'antd/es/message/interface';
import {
  requestRoomInitData,
  requestRoomPlayerUrlV2,
  type RoomInit,
  type RoomPlayUrlV2
} from '@48tools-api/bilibili/live';
import { store } from '../../../../store/store';
import { showSaveDialog } from '../../../../utils/remote/dialog';
import { createV2LiveUrl, ffmpegHeaders, isCNCdnHost } from './helper';
import getFFmpegDownloadWorker from '../../../../utils/worker/FFmpegDownload.worker/getFFmpegDownloadWorker';
import { setAddWorkerItem, setRemoveWorkerItem } from '../../reducers/bilibiliLive';
import { getFFmpeg, getFileTime } from '../../../../utils/utils';
import type { LiveItem, MessageEventData } from '../../../../commonTypes';

/**
 * 创建bilibili直播worker的逻辑封装
 * @param { LiveItem } record
 * @param { MessageInstance | undefined } messageApi - 是否显示消息
 * @param { string | undefined } filePath - 文件路径
 */
async function bilibiliLiveWorker(record: LiveItem, messageApi: MessageInstance | undefined, filePath: string | undefined): Promise<void> {
  const { dispatch }: Store = store;
  const time: string = getFileTime();

  try {
    const resInit: RoomInit = await requestRoomInitData(record.roomId);

    if (resInit.data.live_status !== 1) {
      messageApi && messageApi.warning('直播未开始。');

      return;
    }

    let liveFilePath: string;

    if (filePath) {
      liveFilePath = filePath;
    } else {
      const result: SaveDialogReturnValue = await showSaveDialog({
        defaultPath: `[B站直播]${ record.roomId }_${ time }.flv`
      });

      if (result.canceled || !result.filePath) return;

      liveFilePath = result.filePath;
    }

    const resPlayUrl: RoomPlayUrlV2 = await requestRoomPlayerUrlV2(`${ resInit.data.room_id }`);
    const playStreamPath: string | null = createV2LiveUrl(resPlayUrl);

    if (!playStreamPath) {
      messageApi && messageApi.warning('直播获取错误。');

      return;
    }

    const worker: Worker = getFFmpegDownloadWorker();
    const isCN: boolean = isCNCdnHost(playStreamPath);

    worker.addEventListener('message', function(event1: MessageEvent<MessageEventData>): void {
      const { type, error }: MessageEventData = event1.data;

      if (type === 'close' || type === 'error') {
        if (type === 'error') {
          messageApi && messageApi.error(`${ record.description }[${ record.roomId }]录制失败！`);
          console.error(error);
        }

        worker.terminate();
        dispatch(setRemoveWorkerItem(record.id));
      }
    }, false);

    worker.postMessage({
      type: 'start',
      playStreamPath,
      filePath: liveFilePath,
      ffmpeg: getFFmpeg(),
      ua: isCN,
      ffmpegHeaders: isCN ? ffmpegHeaders() : undefined,
      noDurationFilesize: true
    });

    dispatch(setAddWorkerItem({
      id: record.id,
      worker
    }));
  } catch (err) {
    console.error(err);
    messageApi && messageApi.error('录制失败！');
  }
}

export default bilibiliLiveWorker;