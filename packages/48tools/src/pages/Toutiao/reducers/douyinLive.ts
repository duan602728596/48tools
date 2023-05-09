import { LiveSlice, type LiveSliceInitialState, type SliceSelector } from '../../../store/slice/LiveSlice';
import { douyinLiveObjectStoreName } from '../../../utils/IDB/IDBRedux';

const sliceName: 'douyinLive' = 'douyinLive';

export const liveSlice: LiveSlice<typeof sliceName> = new LiveSlice<typeof sliceName>(sliceName, douyinLiveObjectStoreName);
export const {
  slice: {
    actions: {
      setAddWorkerItem,
      setRemoveWorkerItem
    }
  },
  selectorObject,
  IDBCursorLiveList,
  IDBSaveLiveItem,
  IDBDeleteLiveItem,
  ignoredPaths,
  ignoredActions
}: LiveSlice<typeof sliceName> = liveSlice;

export type { LiveSliceInitialState, SliceSelector };

export default { [sliceName]: liveSlice.slice.reducer };