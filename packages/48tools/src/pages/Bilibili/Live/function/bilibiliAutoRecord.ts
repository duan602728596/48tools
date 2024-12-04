import * as path from 'node:path';
import type { Store } from '@reduxjs/toolkit';
import { store } from '../../../../store/store';
import { getFilePath } from '../../../../utils/utils';
import { liveSlice } from '../../reducers/bilibiliLive';
import { localStorageKey } from './helper';
import bilibiliLiveWorker from './bilibiliLiveWorker';
import type { WebWorkerChildItem } from '../../../../commonTypes';
import type { LiveSliceInitialState } from '../../../../store/slice/LiveSlice';

/* 自动录制直播 */
async function bilibiliAutoRecord(): Promise<void> {
  const { getState }: Store = store;
  const { liveList }: LiveSliceInitialState = getState().bilibiliLive;
  const bilibiliAutoRecordSavePath: string = localStorage.getItem(localStorageKey)!;

  for (const record of liveList) {
    if (!record.autoRecord) continue;

    const index: number = liveSlice.getWorkerList(getState().bilibiliLive).findIndex((o: WebWorkerChildItem): boolean => o.id === record.id);

    if (index >= 0) continue;

    await bilibiliLiveWorker(record, undefined, path.join(bilibiliAutoRecordSavePath, getFilePath({
      typeTitle: 'B站直播',
      infoArray: [record.roomId, record.description],
      ext: 'flv'
    })));
  }
}

export default bilibiliAutoRecord;