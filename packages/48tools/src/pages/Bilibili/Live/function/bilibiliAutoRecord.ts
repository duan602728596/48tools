import * as path from 'node:path';
import type { Store } from '@reduxjs/toolkit';
import { store } from '../../../../store/store';
import { getFFmpeg, getFileTime } from '../../../../utils/utils';
import { setAddLiveBilibiliChildList, setDeleteLiveBilibiliChildList } from '../../reducers/live';
import { requestRoomInitData, requestRoomPlayerUrl } from '../../services/live';
import getFFmpegDownloadWorker from '../../../../utils/worker/FFmpegDownload.worker/getFFmpegDownloadWorker';
import type { WebWorkerChildItem, MessageEventData } from '../../../../commonTypes';
import type { BilibiliLiveInitialState } from '../../reducers/live';
import type { RoomInit, RoomPlayUrl } from '../../services/interface';

/* 自动录制直播 */
async function bilibiliAutoRecord(): Promise<void> {
  const { dispatch, getState }: Store = store;
  const { bilibiliLiveList, liveChildList }: BilibiliLiveInitialState = getState().bilibiliLive;
  const bilibiliAutoRecordSavePath: string = localStorage.getItem('BILIBILI_AUTO_RECORD_SAVE_PATH')!;

  for (const record of bilibiliLiveList) {
    if (!record.autoRecord) continue;

    const index: number = liveChildList.findIndex((o: WebWorkerChildItem): boolean => o.id === record.id);

    if (index >= 0) continue;

    const time: string = getFileTime();

    try {
      const resInit: RoomInit = await requestRoomInitData(record.roomId);

      if (resInit.data.live_status === 1) {
        const resPlayUrl: RoomPlayUrl = await requestRoomPlayerUrl(`${ resInit.data.room_id }`);
        const worker: Worker = getFFmpegDownloadWorker();

        worker.addEventListener('message', function(messageEvent: MessageEvent<MessageEventData>) {
          const { type, error }: MessageEventData = messageEvent.data;

          if (type === 'close' || type === 'error') {
            if (type === 'error') {
              console.error(error);
            }

            worker.terminate();
            dispatch(setDeleteLiveBilibiliChildList(record));
          }
        }, false);

        worker.postMessage({
          type: 'start',
          playStreamPath: resPlayUrl.data.durl[0].url,
          filePath: path.join(bilibiliAutoRecordSavePath, `${ record.roomId }_${ time }.flv`),
          ffmpeg: getFFmpeg(),
          ua: true,
          ffmpegHeaders: `Referer: https://live.bilibili.com/${ record.roomId }\r
Host: live.bilibili.com\r
Origin: https://live.bilibili.com\r`
        });

        dispatch(setAddLiveBilibiliChildList({
          id: record.id,
          worker
        }));
      }
    } catch (err) {
      console.error(err);
    }
  }
}

export default bilibiliAutoRecord;