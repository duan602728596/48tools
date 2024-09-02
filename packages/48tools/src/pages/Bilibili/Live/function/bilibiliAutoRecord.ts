import * as path from 'node:path';
import type { Store } from '@reduxjs/toolkit';
import { store } from '../../../../store/store';
import { getFileTime } from '../../../../utils/utils';
import { liveSlice } from '../../reducers/bilibiliLive';
import { localStorageKey } from './helper';
import liveWorker from './liveWorker';
import type { WebWorkerChildItem, MessageEventData } from '../../../../commonTypes';
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

    const time: string = getFileTime();

    await liveWorker(record, undefined, path.join(bilibiliAutoRecordSavePath, `${ record.roomId }_${ record.description }_${ time }.flv`));
  }
}

export default bilibiliAutoRecord;