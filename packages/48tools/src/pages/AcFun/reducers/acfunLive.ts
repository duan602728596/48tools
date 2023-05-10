import { LiveSlice } from '../../../store/slice/LiveSlice';
import { acfunLiveObjectStoreName } from '../../../utils/IDB/IDBRedux';

const sliceName: 'acfunLive' = 'acfunLive';

export const liveSlice: LiveSlice<typeof sliceName> = new LiveSlice<typeof sliceName>(sliceName, acfunLiveObjectStoreName);
export const {
  slice: {
    actions: {
      setAddWorkerItem,
      setRemoveWorkerItem
    },
    selectors: selectorsObject
  },
  IDBCursorLiveList,
  IDBSaveLiveItem,
  IDBDeleteLiveItem,
  ignoredPaths,
  ignoredActions
}: LiveSlice<typeof sliceName> = liveSlice;

export default { [sliceName]: liveSlice.slice.reducer };