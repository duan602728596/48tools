import { createSlice, Slice, SliceCaseReducers, PayloadAction, CaseReducerActions } from '@reduxjs/toolkit';
import type { WebWorkerChildItem } from '../../../types';
import type { LiveInfo } from '../services/interface';

export interface Pocket48InitialState {
  liveList: Array<LiveInfo>;
  liveChildList: Array<WebWorkerChildItem>;
  recordList: Array<LiveInfo>;
  recordNext: string;
  recordChildList: Array<WebWorkerChildItem>;
}

type CaseReducers = SliceCaseReducers<Pocket48InitialState>;

const { actions, reducer }: Slice = createSlice<Pocket48InitialState, CaseReducers>({
  name: 'pocket48',
  initialState: {
    liveList: [],       // 直播信息
    liveChildList: [],  // 直播下载
    recordList: [],     // 录播信息
    recordNext: '0',    // 记录录播分页位置
    recordChildList: [] // 录播下载
  },
  reducers: {
    // 直播信息
    setLiveList(state: Pocket48InitialState, action: PayloadAction<Array<LiveInfo>>): Pocket48InitialState {
      state.liveList = action.payload;

      return state;
    },

    // 直播下载
    setLiveChildList(state: Pocket48InitialState, action: PayloadAction<Array<WebWorkerChildItem>>): Pocket48InitialState {
      state.liveChildList = action.payload;

      return state;
    },

    // 录播加载
    setRecordList(state: Pocket48InitialState, action: PayloadAction<{ next: string; data: Array<LiveInfo> }>): Pocket48InitialState {
      state.recordList = action.payload.data;
      state.recordNext = action.payload.next;

      return state;
    },

    // 录播下载
    setRecordChildList(state: Pocket48InitialState, action: PayloadAction<Array<WebWorkerChildItem>>): Pocket48InitialState {
      state.recordChildList = action.payload;

      return state;
    }
  }
});

export const {
  setLiveList,
  setLiveChildList,
  setRecordList,
  setRecordChildList
}: CaseReducerActions<CaseReducers> = actions;
export default { pocket48: reducer };