import { LiveSlice } from '../../../store/slice/LiveSlice';
import { kuaishouLiveObjectStoreName } from '../../../utils/IDB/IDBRedux';

const sliceName: 'kuaishouLive' = 'kuaishouLive';

export const liveSlice: LiveSlice<typeof sliceName> = new LiveSlice<typeof sliceName>(sliceName, kuaishouLiveObjectStoreName);
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

export default { [sliceName]: liveSlice.slice.reducer };