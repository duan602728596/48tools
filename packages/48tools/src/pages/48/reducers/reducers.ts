import { createSlice, Slice, SliceCaseReducers, PayloadAction, CaseReducerActions } from '@reduxjs/toolkit';
import type { WebWorkerChildItem } from '../../../types';
import type { LiveInfo } from '../interface';

export interface L48InitialState {
  liveList: Array<LiveInfo>;
  liveChildList: Array<WebWorkerChildItem>;
  recordList: Array<LiveInfo>;
  recordNext: string;
  recordChildList: Array<WebWorkerChildItem>;
}

type CaseReducers = SliceCaseReducers<L48InitialState>;

const { actions, reducer }: Slice = createSlice<L48InitialState, CaseReducers>({
  name: 'l48',
  initialState: {
    liveList: [],       // 直播信息
    liveChildList: [],  // 直播下载
    recordList: [],     // 录播信息
    recordNext: '0',    // 记录录播分页位置
    recordChildList: [] // 录播下载
  },
  reducers: {
    // 直播信息
    setLiveList(state: L48InitialState, action: PayloadAction<Array<LiveInfo>>): L48InitialState {
      state.liveList = action.payload;

      return state;
    },

    // 直播下载
    setLiveChildList(state: L48InitialState, action: PayloadAction<Array<WebWorkerChildItem>>): L48InitialState {
      state.liveChildList = action.payload;

      return state;
    },

    // 录播加载
    setRecordList(state: L48InitialState, action: PayloadAction<{ next: string; data: Array<LiveInfo> }>): L48InitialState {
      state.recordList = action.payload.data;
      state.recordNext = action.payload.next;

      return state;
    },

    // 录播下载
    setRecordChildList(state: L48InitialState, action: PayloadAction<Array<WebWorkerChildItem>>): L48InitialState {
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
export default { l48: reducer };