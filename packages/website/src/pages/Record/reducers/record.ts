import { createSlice, type Slice, type SliceCaseReducers, type PayloadAction, type CaseReducerActions } from '@reduxjs/toolkit';
import type { LiveInfo, RoomId } from '../../../../api/services/interface';

export interface RecordInitialState {
  next: string | undefined;
  liveList: Array<LiveInfo>;
  roomId: RoomId | undefined;
}

type CaseReducers = SliceCaseReducers<RecordInitialState>;

const { actions, reducer }: Slice = createSlice<RecordInitialState, CaseReducers, 'record'>({
  name: 'record',
  initialState: {
    next: undefined,  // 搜索的next
    liveList: [],     // 搜索结果
    roomId: undefined // 搜索的id
  },
  reducers: {
    setRoomId(state: RecordInitialState, action: PayloadAction<RoomId>): void {
      state.roomId = action.payload;
    },

    setLiveList(state: RecordInitialState, action: PayloadAction<Pick<RecordInitialState, 'next' | 'liveList'>>) {
      state.next = action.payload.next;
      state.liveList = action.payload.liveList;
    }
  }
});

export const {
  setRoomId,
  setLiveList
}: CaseReducerActions<CaseReducers> = actions;
export default { record: reducer };