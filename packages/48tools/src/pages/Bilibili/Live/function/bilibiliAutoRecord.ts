import * as path from 'node:path';
import type { Store } from '@reduxjs/toolkit';
import { requestRoomInitData, requestRoomPlayerUrlV2, type RoomInit, type RoomPlayUrlV2 } from '@48tools-api/bilibili/live';
import { store } from '../../../../store/store';
import { getFFmpeg, getFileTime } from '../../../../utils/utils';
import { liveSlice, setAddWorkerItem, setRemoveWorkerItem } from '../../reducers/bilibiliLive';
import getFFmpegDownloadWorker from '../../../../utils/worker/FFmpegDownload.worker/getFFmpegDownloadWorker';
import { ffmpegHeaders, isCNCdnHost, localStorageKey, createV2LiveUrl } from './helper';
import type { WebWorkerChildItem, MessageEventData } from '../../../../commonTypes';
import type { LiveSliceInitialState } from '../../../../store/slice/LiveSlice';

/* 自动录制直播 */
async function bilibiliAutoRecord(): Promise<void> {
  const { dispatch, getState }: Store = store;
  const { liveList }: LiveSliceInitialState = getState().bilibiliLive;
  const bilibiliAutoRecordSavePath: string = localStorage.getItem(localStorageKey)!;

  for (const record of liveList) {
    if (!record.autoRecord) continue;

    const index: number = liveSlice.getWorkerList(getState().bilibiliLive).findIndex((o: WebWorkerChildItem): boolean => o.id === record.id);

    if (index >= 0) continue;

    const time: string = getFileTime();

    try {
      const resInit: RoomInit = await requestRoomInitData(record.roomId);

      if (resInit.data.live_status === 1) {
        const resPlayUrl: RoomPlayUrlV2 = await requestRoomPlayerUrlV2(`${ resInit.data.room_id }`);
        const playStreamPath: string | null = createV2LiveUrl(resPlayUrl);

        if (playStreamPath) {
          const worker: Worker = getFFmpegDownloadWorker();
          const isCN: boolean = isCNCdnHost(playStreamPath);

          worker.addEventListener('message', function(messageEvent: MessageEvent<MessageEventData>) {
            const { type, error }: MessageEventData = messageEvent.data;

            if (type === 'close' || type === 'error') {
              if (type === 'error') {
                console.error(error);
              }

              worker.terminate();
              dispatch(setRemoveWorkerItem(record.id));
            }
          }, false);

          worker.postMessage({
            type: 'start',
            playStreamPath,
            filePath: path.join(bilibiliAutoRecordSavePath, `${ record.roomId }_${ record.description }_${ time }.flv`),
            ffmpeg: getFFmpeg(),
            ua: isCN,
            ffmpegHeaders: isCN ? ffmpegHeaders() : undefined
          });

          dispatch(setAddWorkerItem({
            id: record.id,
            worker
          }));
        }
      }
    } catch (err) {
      console.error(err);
    }
  }
}

export default bilibiliAutoRecord;