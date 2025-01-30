import { LiveSlice } from '../../../store/slice/LiveSlice';
import { xiaohongshuLiveObjectStoreName } from '../../../utils/IDB/IDBRedux';

const sliceName: 'xiaohongshuLive' = 'xiaohongshuLive';

export const liveSlice: LiveSlice<typeof sliceName> = new LiveSlice<typeof sliceName>(sliceName, xiaohongshuLiveObjectStoreName);
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