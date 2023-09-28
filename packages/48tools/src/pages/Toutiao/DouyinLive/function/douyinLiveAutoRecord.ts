import * as path from 'node:path';
import type { Store } from '@reduxjs/toolkit';
import { requestLiveEnter, requestTtwidCookie, type LiveEnter } from '@48tools-api/toutiao/douyin';
import { store } from '../../../../store/store';
import { getFFmpeg, getFileTime } from '../../../../utils/utils';
import { liveSlice, setAddWorkerItem, setRemoveWorkerItem } from '../../reducers/douyinLive';
import getFFmpegDownloadWorker from '../../../../utils/worker/FFmpegDownload.worker/getFFmpegDownloadWorker';
import { douyinCookie } from '../../../../utils/toutiao/DouyinCookieStore';
import type { WebWorkerChildItem, MessageEventData } from '../../../../commonTypes';
import type { LiveSliceInitialState } from '../../../../store/slice/LiveSlice';

/* 自动录制直播 */
async function douyinLiveAutoRecord(): Promise<void> {
  const { dispatch, getState }: Store = store;
  const { liveList }: LiveSliceInitialState = getState().douyinLive;
  const bilibiliAutoRecordSavePath: string = localStorage.getItem('DOUYIN_LIVE_AUTO_RECORD_SAVE_PATH')!;

  await requestTtwidCookie(); // 获取ttwid的cookie

  for (const record of liveList) {
    if (!record.autoRecord) continue;

    const index: number = liveSlice._workerList.findIndex((o: WebWorkerChildItem): boolean => o.id === record.id);

    if (index >= 0) continue;

    const time: string = getFileTime();

    try {
      const resInit: LiveEnter | string = await requestLiveEnter(douyinCookie.toString(), record.roomId);

      if (typeof resInit === 'object' && resInit?.data?.data?.length && resInit.data.data[0]?.stream_url) {
        const worker: Worker = getFFmpegDownloadWorker();

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
          playStreamPath: resInit.data.data[0].stream_url.flv_pull_url.FULL_HD1,
          filePath: path.join(bilibiliAutoRecordSavePath, `${ record.roomId }_${ record.description }_${ time }.flv`),
          ffmpeg: getFFmpeg(),
          ua: true
        });

        dispatch(setAddWorkerItem({
          id: record.id,
          worker
        }));
      }
    } catch (err) {
      console.error(err);
    }
  }
}

export default douyinLiveAutoRecord;