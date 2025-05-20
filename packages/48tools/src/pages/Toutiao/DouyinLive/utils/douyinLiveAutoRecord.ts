import * as path from 'node:path';
import type { Store } from '@reduxjs/toolkit';
import { requestLiveEnter, requestLiveReflowInfo, requestTtwidCookie, type LiveEnter, type LiveReflowInfo } from '@48tools-api/toutiao/douyin';
import { store } from '../../../../store/store';
import { getFFmpeg, getFilePath } from '../../../../utils/utils';
import { liveSlice, setAddWorkerItem, setRemoveWorkerItem } from '../../reducers/douyinLive';
import getFFmpegDownloadWorker from '../../../../utils/worker/FFmpegDownload.worker/getFFmpegDownloadWorker';
import { douyinCookie } from '../../../../utils/toutiao/DouyinCookieStore';
import type { WebWorkerChildItem, MessageEventData, LiveItem } from '../../../../commonTypes';
import type { LiveSliceInitialState } from '../../../../store/slice/LiveSlice';

/* 创建worker */
function createWorker(record: LiveItem, playStreamPath: string, douyinAutoRecordSavePath: string): void {
  const { dispatch }: Store = store;
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
    playStreamPath,
    filePath: path.join(douyinAutoRecordSavePath, getFilePath({
      typeTitle: '抖音直播',
      infoArray: [record.roomId, record.description],
      ext: 'flv'
    })),
    ffmpeg: getFFmpeg(),
    ua: true
  });

  dispatch(setAddWorkerItem({
    id: record.id,
    worker
  }));
}

/* 自动录制直播 */
async function douyinLiveAutoRecord(): Promise<void> {
  const { getState }: Store = store;
  const { liveList }: LiveSliceInitialState = getState().douyinLive;
  const douyinAutoRecordSavePath: string = localStorage.getItem('DOUYIN_LIVE_AUTO_RECORD_SAVE_PATH')!;

  await requestTtwidCookie(); // 获取ttwid的cookie

  for (const record of liveList) {
    if (!record.autoRecord) continue;

    const index: number = liveSlice.getWorkerList(getState().douyinLive)
      .findIndex((o: WebWorkerChildItem): boolean => o.id === record.id);

    if (index >= 0) continue;

    try {
      const resInit: LiveEnter | string = await requestLiveEnter(douyinCookie.toString(), record.roomId);

      if (typeof resInit !== 'object') return;

      if (resInit?.data?.data?.length && resInit.data.data[0]?.stream_url) {
        return createWorker(record, resInit.data.data[0].stream_url.flv_pull_url.FULL_HD1, douyinAutoRecordSavePath);
      }

      const resInit2: LiveReflowInfo | string = await requestLiveReflowInfo(douyinCookie.toString(), record.roomId, resInit.data.user.sec_uid);

      if (typeof resInit2 !== 'object') return;

      if (resInit2?.data?.room?.stream_url) {
        return createWorker(record, resInit2.data.room.stream_url.flv_pull_url.FULL_HD1, douyinAutoRecordSavePath);
      }
    } catch (err) {
      console.error(err);
    }
  }
}

export default douyinLiveAutoRecord;