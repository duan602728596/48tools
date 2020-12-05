import { createSlice, Slice, SliceCaseReducers, PayloadAction, CaseReducerActions } from '@reduxjs/toolkit';
import type { LiveInfo } from '../types';

export interface LiveChildItem {
  id: string;
  worker: Worker;
}

export interface L48InitialState {
  liveList: Array<LiveInfo>;
  liveChildList: Array<LiveChildItem>;
  recordList: Array<LiveInfo>;
  recordNext: string;
}

type CaseReducers = SliceCaseReducers<L48InitialState>;

const { actions, reducer }: Slice = createSlice<L48InitialState, CaseReducers>({
  name: 'l48',
  initialState: {
    liveList: [],      // 直播信息
    liveChildList: [], // 直播下载
    recordList: [],    // 录播信息
    recordNext: '0'    // 记录录播分页位置
  },
  reducers: {
    // 直播信息
    setLiveList(state: L48InitialState, action: PayloadAction<Array<LiveInfo>>): L48InitialState {
      state.liveList = action.payload;

      return state;
    },

    // 直播下载
    setLiveChildList(state: L48InitialState, action: PayloadAction<Array<LiveChildItem>>): L48InitialState {
      state.liveChildList = action.payload;

      return state;
    },

    // 录播加载
    setRecordList(state: L48InitialState, action: PayloadAction<{ next: string; data: Array<LiveInfo> }>): L48InitialState {
      state.recordList = action.payload.data;
      state.recordNext = action.payload.next;

      return state;
    }
  }
});

export const { setLiveList, setLiveChildList, setRecordList }: CaseReducerActions<CaseReducers> = actions;
export default { l48: reducer };