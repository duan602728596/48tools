import { LiveSlice } from '../../../store/slice/LiveSlice';
import { douyinLiveObjectStoreName } from '../../../utils/IDB/IDBRedux';

const sliceName: 'douyinLive' = 'douyinLive';

export const liveSlice: LiveSlice<typeof sliceName> = new LiveSlice<typeof sliceName>(sliceName, douyinLiveObjectStoreName);
export const {
  slice: {
    actions: {
      setAddWorkerItem,
      setRemoveWorkerItem,
      setAutoRecordTimer
    },
    selectors: selectorsObject
  },
  IDBCursorLiveList,
  IDBSaveLiveItem,
  IDBSaveAutoRecordLiveItem,
  IDBDeleteLiveItem,
  ignoredPaths,
  ignoredActions
}: LiveSlice<typeof sliceName> = liveSlice;

export default { [sliceName]: liveSlice.slice.reducer };