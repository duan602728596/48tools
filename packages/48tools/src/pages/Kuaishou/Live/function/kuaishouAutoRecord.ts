import * as path from 'node:path';
import type { Store } from '@reduxjs/toolkit';
import { store } from '../../../../store/store';
import { getFFmpeg, getFileTime } from '../../../../utils/utils';
import { liveSlice, setAddWorkerItem, setRemoveWorkerItem } from '../../reducers/kuaishouLive';
import getFFmpegDownloadWorker from '../../../../utils/worker/FFmpegDownload.worker/getFFmpegDownloadWorker';
import { localStorageKey } from './helper';
import getLiveInfo from './getLiveInfo';
import type { WebWorkerChildItem, MessageEventData } from '../../../../commonTypes';
import type { LiveSliceInitialState } from '../../../../store/slice/LiveSlice';
import type { LiveInfo, PlayUrlItem } from '../../types';

/* 自动录制直播 */
async function kuaishouAutoRecord(): Promise<void> {
  const { dispatch, getState }: Store = store;
  const { liveList }: LiveSliceInitialState = getState().kuaishouLive;
  const kuaishouAutoRecordSavePath: string = localStorage.getItem(localStorageKey)!;

  for (const record of liveList) {
    if (!record.autoRecord) continue;

    const index: number = liveSlice.getWorkerList(getState().kuaishouLive).findIndex((o: WebWorkerChildItem): boolean => o.id === record.id);

    if (index >= 0) continue;

    const time: string = getFileTime();

    try {
      const liveInfo: LiveInfo | undefined = await getLiveInfo(record.roomId);
      const playUrlItem: PlayUrlItem | undefined = liveInfo?.list?.at?.(-1);

      if (liveInfo && playUrlItem) {
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
          playStreamPath: playUrlItem.url,
          filePath: path.join(kuaishouAutoRecordSavePath, `${ record.roomId }_${ record.description }_${ time }.flv`),
          ffmpeg: getFFmpeg()
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

export default kuaishouAutoRecord;