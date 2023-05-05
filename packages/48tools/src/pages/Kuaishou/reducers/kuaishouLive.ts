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
import IDBRedux, { kuaishouLiveObjectStoreName } from '../../../utils/IDB/IDBRedux';
import type { WebWorkerChildItem, LiveItem } from '../../../commonTypes';

// 录制时的webworker
export const kuaishouLiveWorkerListAdapter: EntityAdapter<WebWorkerChildItem> = createEntityAdapter({
  selectId: (item: WebWorkerChildItem): string => item.id
});
export const kuaishouLiveWorkerListSelectors: EntitySelectors<WebWorkerChildItem, EntityState<WebWorkerChildItem>>
  = kuaishouLiveWorkerListAdapter.getSelectors();

export interface KuaishouLiveInitialState extends EntityState<WebWorkerChildItem> {
  kuaishouLiveList: Array<LiveItem>;
}

type SliceReducers = {
  setAddDownloadWorker: CaseReducer<KuaishouLiveInitialState, PayloadAction<WebWorkerChildItem>>;
  setRemoveDownloadWorker: CaseReducer<KuaishouLiveInitialState, PayloadAction<string>>;
  setKuaishouLiveFromDB: CaseReducer<KuaishouLiveInitialState, PayloadAction<{ result: Array<LiveItem> }>>;
  setKuaishouAddFromDB: CaseReducer<KuaishouLiveInitialState, PayloadAction<{ data: LiveItem }>>;
  setKuaishouDeleteFromDB: CaseReducer<KuaishouLiveInitialState, PayloadAction<{ query: string }>>;
};

const sliceName: 'kuaishouLive' = 'kuaishouLive';
const { actions, reducer }: Slice<KuaishouLiveInitialState, SliceReducers, typeof sliceName> = createSlice({
  name: sliceName,
  initialState: kuaishouLiveWorkerListAdapter.getInitialState({
    kuaishouLiveList: []
  }),
  reducers: {
    setAddDownloadWorker: kuaishouLiveWorkerListAdapter.addOne,       // 添加下载
    setRemoveDownloadWorker: kuaishouLiveWorkerListAdapter.removeOne, // 删除下载

    // 从数据库里查
    setKuaishouLiveFromDB(state: KuaishouLiveInitialState, action: PayloadAction<{ result: Array<LiveItem> }>): void {
      state.kuaishouLiveList = action.payload.result;
    },

    // 添加
    setKuaishouAddFromDB(state: KuaishouLiveInitialState, action: PayloadAction<{ data: LiveItem }>): void {
      const index: number = state.kuaishouLiveList.findIndex(
        (o: LiveItem): boolean => o.id === action.payload.data.id);

      if (index < 0) {
        state.kuaishouLiveList = state.kuaishouLiveList.concat([action.payload.data]);
      }
    },

    // 删除
    setKuaishouDeleteFromDB(state: KuaishouLiveInitialState, action: PayloadAction<{ query: string }>): void {
      const index: number = state.kuaishouLiveList.findIndex((o: LiveItem): boolean => o.id === action.payload.query);

      if (index >= 0) {
        const nextKuaishouLiveList: Array<LiveItem> = [...state.kuaishouLiveList];

        nextKuaishouLiveList.splice(index, 1);
        state.kuaishouLiveList = nextKuaishouLiveList;
      }
    }
  }
});

export const {
  setAddDownloadWorker,
  setRemoveDownloadWorker,
  setKuaishouLiveFromDB,
  setKuaishouAddFromDB,
  setKuaishouDeleteFromDB
}: CaseReducerActions<SliceReducers, typeof sliceName> = actions;

// 获取数据
export const IDBCursorKuaishouRoomInfo: CursorDispatchFunc = IDBRedux.cursorAction({
  objectStoreName: kuaishouLiveObjectStoreName,
  successAction: setKuaishouLiveFromDB
});

// 保存数据
export const IDBSaveKuaishouRoomInfo: DataDispatchFunc = IDBRedux.putAction({
  objectStoreName: kuaishouLiveObjectStoreName,
  successAction: setKuaishouAddFromDB
});

// 删除数据
export const IDBDeleteKuaishouRoomInfo: QueryDispatchFunc = IDBRedux.deleteAction({
  objectStoreName: kuaishouLiveObjectStoreName,
  successAction: setKuaishouDeleteFromDB
});

export default { [sliceName]: reducer };