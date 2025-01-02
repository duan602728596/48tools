import { LiveSlice } from '../../../store/slice/LiveSlice';
import { showroomLiveObjectStoreName } from '../../../utils/IDB/IDBRedux';

const sliceName: 'showroomLive' = 'showroomLive';

export const liveSlice: LiveSlice<typeof sliceName> = new LiveSlice<typeof sliceName>(sliceName, showroomLiveObjectStoreName);
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
  IDBSaveAutoRecordLiveItem,
  IDBDeleteLiveItem,
  ignoredPaths,
  ignoredActions
}: LiveSlice<typeof sliceName> = liveSlice;
export default { [sliceName]: liveSlice.slice.reducer };