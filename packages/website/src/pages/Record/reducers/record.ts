import { createSlice, type Slice, type PayloadAction, type CaseReducer, type CaseReducerActions } from '@reduxjs/toolkit';
import type { RoomId } from '../../../../src-api/services/interface';
import type { RecordLiveInfo } from '../types';

export interface RecordInitialState {
  next: string | undefined;
  liveList: Array<RecordLiveInfo>;
  roomId: RoomId | undefined;
  inDownloading: boolean;
}

type SliceReducers = {
  setRoomId: CaseReducer<RecordInitialState, PayloadAction<RoomId>>;
  setLiveList: CaseReducer<RecordInitialState, PayloadAction<Pick<RecordInitialState, 'next' | 'liveList'>>>;
  setLiveInfoItemCheckedChange: CaseReducer<RecordInitialState, PayloadAction<{ liveId: string; value: boolean }>>;
  setLiveListCheckedClean: CaseReducer<RecordInitialState, PayloadAction>;
  setInDownloading: CaseReducer<RecordInitialState, PayloadAction<boolean>>;
};

const sliceName: 'record' = 'record';
const { actions, reducer }: Slice<RecordInitialState, SliceReducers, typeof sliceName> = createSlice({
  name: 'record',
  initialState: {
    next: undefined,     // 搜索的next
    liveList: [],        // 搜索结果
    roomId: undefined,   // 搜索的id
    inDownloading: false // 下载中
  },
  reducers: {
    setRoomId(state: RecordInitialState, action: PayloadAction<RoomId>): void {
      state.roomId = action.payload;
    },

    setLiveList(state: RecordInitialState, action: PayloadAction<Pick<RecordInitialState, 'next' | 'liveList'>>) {
      state.next = action.payload.next;
      state.liveList = action.payload.liveList;
    },

    // 修改checked的状态
    setLiveInfoItemCheckedChange(state: RecordInitialState, action: PayloadAction<{ liveId: string; value: boolean }>): void {
      const item: RecordLiveInfo | undefined = state.liveList.find(
        (o: RecordLiveInfo): boolean => o.liveId === action.payload.liveId);

      if (item) {
        item.checked = action.payload.value;
        state.liveList = [...state.liveList];
      }
    },

    // 清空选中
    setLiveListCheckedClean(state: RecordInitialState, action: PayloadAction): void {
      state.liveList = state.liveList.map((item: RecordLiveInfo): RecordLiveInfo => {
        item.checked === true && (item.checked = false);

        return item;
      });
    },

    // 设置下载的状态
    setInDownloading(state: RecordInitialState, action: PayloadAction<boolean>): void {
      state.inDownloading = action.payload;
    }
  }
});

export const {
  setRoomId,
  setLiveList,
  setLiveInfoItemCheckedChange,
  setLiveListCheckedClean,
  setInDownloading
}: CaseReducerActions<SliceReducers, typeof sliceName> = actions;
export default { record: reducer };