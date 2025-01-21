import * as path from 'node:path';
import type { Store } from '@reduxjs/toolkit';
import { store } from '../../../store/store';
import type { LiveSliceInitialState } from '../../../store/slice/LiveSlice';
import { localStorageKey } from './helper';
import { liveSlice } from '../reducers/showroomLive';
import showroomLiveWorker from './showroomLiveWorker';
import type { WebWorkerChildItem } from '../../../commonTypes';
import { getFilePath } from '../../../utils/utils';

/* 自动录制 */

export async function showroomLiveAutoRecord(): Promise<void> {
  const { getState }: Store = store;
  const { liveList }: LiveSliceInitialState = getState().showroomLive;
  const showroomLiveAutoRecordSavePath: string = localStorage.getItem(localStorageKey)!;

  for (const record of liveList) {
    if (!record.autoRecord) continue;

    const index: number = liveSlice.getWorkerList(getState().showroomLive).findIndex((o: WebWorkerChildItem): boolean => o.id === record.id);

    if (index >= 0) continue;

    await showroomLiveWorker(record, undefined, path.join(showroomLiveAutoRecordSavePath, getFilePath({
      typeTitle: 'showroom-live',
      infoArray: [record.roomId, record.description],
      ext: 'ts'
    })));
  }
}