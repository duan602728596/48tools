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
import { RoomVoiceItem } from '../types';
import type { WebWorkerChildItem } from '../../../commonTypes';

// 录制时的webworker
export const roomVoiceWorkerListAdapter: EntityAdapter<WebWorkerChildItem> = createEntityAdapter({
  selectId: (item: WebWorkerChildItem): string => item.id
});
export const roomVoiceListSelectors: EntitySelectors<WebWorkerChildItem, EntityState<WebWorkerChildItem>>
  = roomVoiceWorkerListAdapter.getSelectors();

export interface RoomVoiceInitialState extends EntityState<WebWorkerChildItem> {
  roomVoice: Array<RoomVoiceItem>;
}

type SliceReducers = {
  setAddDownloadWorker: CaseReducer<RoomVoiceInitialState, PayloadAction<WebWorkerChildItem>>;
  setRemoveDownloadWorker: CaseReducer<RoomVoiceInitialState, PayloadAction<string>>;
  setRoomVoiceFromDB: CaseReducer<RoomVoiceInitialState, PayloadAction<{ result: Array<RoomVoiceItem> }>>;
  setDeleteRoomVoiceFromDB: CaseReducer<RoomVoiceInitialState, PayloadAction<{ query: string }>>;
};

const sliceName: 'roomVoice' = 'roomVoice';
const { actions, reducer }: Slice<RoomVoiceInitialState, SliceReducers, typeof sliceName> = createSlice({
  name: sliceName,
  initialState: roomVoiceWorkerListAdapter.getInitialState({
    roomVoice: [] // 从数据库中查找的记录serverId和channel的列表
  }),
  reducers: {
    setAddDownloadWorker: roomVoiceWorkerListAdapter.addOne,       // 添加下载
    setRemoveDownloadWorker: roomVoiceWorkerListAdapter.removeOne, // 删除下载

    // 从数据库里查
    setRoomVoiceFromDB(state: RoomVoiceInitialState, action: PayloadAction<{ result: Array<RoomVoiceItem> }>): void {
      state.roomVoice = action.payload.result;
    },

    // 直播间列表内删除一个直播间
    setDeleteRoomVoiceFromDB(state: RoomVoiceInitialState, action: PayloadAction<{ query: string }>): void {
      const index: number = state.roomVoice.findIndex((o: RoomVoiceItem): boolean => o.id === action.payload.query);

      if (index >= 0) {
        const nextRoomVoice: Array<RoomVoiceItem> = [...state.roomVoice];

        nextRoomVoice.splice(index, 1);
        state.roomVoice = nextRoomVoice;
      }
    }
  }
});

export const {
  setAddDownloadWorker,
  setRemoveDownloadWorker,
  setRoomVoiceFromDB,
  setDeleteRoomVoiceFromDB
}: CaseReducerActions<SliceReducers, typeof sliceName> = actions;
export default { [sliceName]: reducer };