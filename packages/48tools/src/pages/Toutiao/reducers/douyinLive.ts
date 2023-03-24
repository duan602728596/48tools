import {
  createSlice,
  createEntityAdapter,
  type Slice,
  type PayloadAction,
  type CaseReducer,
  type CaseReducerActions,
  type EntityAdapter,
  type EntityState,
  type EntitySelectors
} from '@reduxjs/toolkit';
import type { DataDispatchFunc, CursorDispatchFunc, QueryDispatchFunc } from '@indexeddb-tools/indexeddb-redux';
import IDBRedux, { douyinLiveObjectStoreName } from '../../../utils/IDB/IDBRedux';
import type { WebWorkerChildItem } from '../../../commonTypes';
import type { DouyinLiveItem } from '../types';

// 录制时的webworker
export const douyinLiveWorkerListAdapter: EntityAdapter<WebWorkerChildItem> = createEntityAdapter({
  selectId: (item: WebWorkerChildItem): string => item.id
});
export const douyinLiveWorkerListSelectors: EntitySelectors<WebWorkerChildItem, EntityState<WebWorkerChildItem>>
  = douyinLiveWorkerListAdapter.getSelectors();

export interface DouyinLiveInitialState extends EntityState<WebWorkerChildItem> {
  douyinLiveList: Array<DouyinLiveItem>;
}

type SliceReducers = {
  setAddDownloadWorker: CaseReducer<DouyinLiveInitialState, PayloadAction<WebWorkerChildItem>>;
  setRemoveDownloadWorker: CaseReducer<DouyinLiveInitialState, PayloadAction<string>>;
  setDouyinLiveFromDB: CaseReducer<DouyinLiveInitialState, PayloadAction<{ result: Array<DouyinLiveItem> }>>;
  setDouyinAddFromDB: CaseReducer<DouyinLiveInitialState, PayloadAction<{ data: DouyinLiveItem }>>;
  setDouyinDeleteFromDB: CaseReducer<DouyinLiveInitialState, PayloadAction<{ query: string }>>;
};

const sliceName: 'douyinLive' = 'douyinLive';
const { actions, reducer }: Slice<DouyinLiveInitialState, SliceReducers, typeof sliceName> = createSlice({
  name: sliceName,
  initialState: douyinLiveWorkerListAdapter.getInitialState({
    douyinLiveList: []
  }),
  reducers: {
    setAddDownloadWorker: douyinLiveWorkerListAdapter.addOne,       // 添加下载
    setRemoveDownloadWorker: douyinLiveWorkerListAdapter.removeOne, // 删除下载

    // 从数据库里查
    setDouyinLiveFromDB(state: DouyinLiveInitialState, action: PayloadAction<{ result: Array<DouyinLiveItem> }>): void {
      state.douyinLiveList = action.payload.result;
    },

    // 添加
    setDouyinAddFromDB(state: DouyinLiveInitialState, action: PayloadAction<{ data: DouyinLiveItem }>): void {
      const index: number = state.douyinLiveList.findIndex(
        (o: DouyinLiveItem): boolean => o.id === action.payload.data.id);

      if (index < 0) {
        state.douyinLiveList = state.douyinLiveList.concat([action.payload.data]);
      }
    },

    // 删除
    setDouyinDeleteFromDB(state: DouyinLiveInitialState, action: PayloadAction<{ query: string }>): void {
      const index: number = state.douyinLiveList.findIndex((o: DouyinLiveItem): boolean => o.id === action.payload.query);

      if (index >= 0) {
        const nextDouyinLiveList: Array<DouyinLiveItem> = [...state.douyinLiveList];

        nextDouyinLiveList.splice(index, 1);
        state.douyinLiveList = nextDouyinLiveList;
      }
    }
  }
});

export const {
  setAddDownloadWorker,
  setRemoveDownloadWorker,
  setDouyinLiveFromDB,
  setDouyinAddFromDB,
  setDouyinDeleteFromDB
}: CaseReducerActions<SliceReducers, typeof sliceName> = actions;

// 获取数据
export const IDBCursorRoomVoiceInfo: CursorDispatchFunc = IDBRedux.cursorAction({
  objectStoreName: douyinLiveObjectStoreName,
  successAction: setDouyinLiveFromDB
});

// 保存数据
export const IDBSaveRoomVoiceInfo: DataDispatchFunc = IDBRedux.putAction({
  objectStoreName: douyinLiveObjectStoreName,
  successAction: setDouyinAddFromDB
});

// 删除数据
export const IDBDeleteRoomVoiceInfo: QueryDispatchFunc = IDBRedux.deleteAction({
  objectStoreName: douyinLiveObjectStoreName,
  successAction: setDouyinDeleteFromDB
});

export default { [sliceName]: reducer };