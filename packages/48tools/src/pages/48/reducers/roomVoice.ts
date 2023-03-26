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
import IDBRedux, { pocket48RoomVoiceObjectStoreName } from '../../../utils/IDB/IDBRedux';
import type { RoomVoiceItem } from '../types';
import type { WebWorkerChildItem } from '../../../commonTypes';

// 录制时的webworker
export const roomVoiceWorkerListAdapter: EntityAdapter<WebWorkerChildItem> = createEntityAdapter({
  selectId: (item: WebWorkerChildItem): string => item.id
});
export const roomVoiceListSelectors: EntitySelectors<WebWorkerChildItem, EntityState<WebWorkerChildItem>>
  = roomVoiceWorkerListAdapter.getSelectors();

export interface RoomVoiceInitialState extends EntityState<WebWorkerChildItem> {
  roomVoice: Array<RoomVoiceItem>;
  isAutoRecord: boolean;
}

type SliceReducers = {
  setAddDownloadWorker: CaseReducer<RoomVoiceInitialState, PayloadAction<WebWorkerChildItem>>;
  setRemoveDownloadWorker: CaseReducer<RoomVoiceInitialState, PayloadAction<string>>;
  setRoomVoiceFromDB: CaseReducer<RoomVoiceInitialState, PayloadAction<{ result: Array<RoomVoiceItem> }>>;
  setAddRoomVoice: CaseReducer<RoomVoiceInitialState, PayloadAction<{ data: RoomVoiceItem }>>;
  setUpdateRoomVoice: CaseReducer<RoomVoiceInitialState, PayloadAction<{ data: RoomVoiceItem }>>;
  setDeleteRoomVoiceFromDB: CaseReducer<RoomVoiceInitialState, PayloadAction<{ query: string }>>;
  setAutoRecord: CaseReducer<RoomVoiceInitialState, PayloadAction<boolean>>;
};

const sliceName: 'roomVoice' = 'roomVoice';
const { actions, reducer }: Slice<RoomVoiceInitialState, SliceReducers, typeof sliceName> = createSlice({
  name: sliceName,
  initialState: roomVoiceWorkerListAdapter.getInitialState({
    roomVoice: [],      // 从数据库中查找的记录serverId和channel的列表
    isAutoRecord: false // 自动抓取
  }),
  reducers: {
    setAddDownloadWorker: roomVoiceWorkerListAdapter.addOne,       // 添加下载
    setRemoveDownloadWorker: roomVoiceWorkerListAdapter.removeOne, // 删除下载

    // 从数据库里查
    setRoomVoiceFromDB(state: RoomVoiceInitialState, action: PayloadAction<{ result: Array<RoomVoiceItem> }>): void {
      state.roomVoice = action.payload.result;
    },

    // 添加
    setAddRoomVoice(state: RoomVoiceInitialState, action: PayloadAction<{ data: RoomVoiceItem }>): void {
      const index: number = state.roomVoice.findIndex(
        (o: RoomVoiceItem): boolean => o.serverId === action.payload.data.serverId);

      if (index < 0) {
        state.roomVoice = state.roomVoice.concat([action.payload.data]);
      }
    },

    // 更新
    setUpdateRoomVoice(state: RoomVoiceInitialState, action: PayloadAction<{ data: RoomVoiceItem }>): void {
      const index: number = state.roomVoice.findIndex((o: RoomVoiceItem): boolean => o.id === action.payload.data.id);

      if (index >= 0) {
        const nextRoomVoice: Array<RoomVoiceItem> = [...state.roomVoice];

        nextRoomVoice[index].autoRecord = action.payload.data.autoRecord;
        state.roomVoice = nextRoomVoice;
      }
    },

    // 删除
    setDeleteRoomVoiceFromDB(state: RoomVoiceInitialState, action: PayloadAction<{ query: string }>): void {
      const index: number = state.roomVoice.findIndex((o: RoomVoiceItem): boolean => o.id === action.payload.query);

      if (index >= 0) {
        const nextRoomVoice: Array<RoomVoiceItem> = [...state.roomVoice];

        nextRoomVoice.splice(index, 1);
        state.roomVoice = nextRoomVoice;
      }
    },

    // 自动抓取
    setAutoRecord(state: RoomVoiceInitialState, action: PayloadAction<boolean>): void {
      state.isAutoRecord = action.payload;
    }
  }
});

export const {
  setAddDownloadWorker,
  setRemoveDownloadWorker,
  setRoomVoiceFromDB,
  setAddRoomVoice,
  setUpdateRoomVoice,
  setDeleteRoomVoiceFromDB,
  setAutoRecord
}: CaseReducerActions<SliceReducers, typeof sliceName> = actions;

// 获取数据
export const IDBCursorRoomVoiceInfo: CursorDispatchFunc = IDBRedux.cursorAction({
  objectStoreName: pocket48RoomVoiceObjectStoreName,
  successAction: setRoomVoiceFromDB
});

// 保存数据
export const IDBSaveRoomVoiceInfo: DataDispatchFunc = IDBRedux.putAction({
  objectStoreName: pocket48RoomVoiceObjectStoreName,
  successAction: setAddRoomVoice
});

// 更新数据
export const IDBUpdateRoomVoiceInfo: DataDispatchFunc = IDBRedux.putAction({
  objectStoreName: pocket48RoomVoiceObjectStoreName,
  successAction: setUpdateRoomVoice
});

// 删除数据
export const IDBDeleteRoomVoiceInfo: QueryDispatchFunc = IDBRedux.deleteAction({
  objectStoreName: pocket48RoomVoiceObjectStoreName,
  successAction: setDeleteRoomVoiceFromDB
});

export default { [sliceName]: reducer };